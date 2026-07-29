// ============================================================
// Enterprise Import Framework v1.0 — Parser
// SBBT CRM v2
//
// Template parser: validates template headers, column structure,
// and extracts row data from a parsed Excel structure.
//
// This parser works on pre-parsed data arrays (not Excel files).
// Excel parsing (xlsx) will be added in Phase 2.
// ============================================================

import type {
  ColumnConfig,
  RawRow,
  TemplateHeader,
  ImportError,
  ImportWarning,
} from "./Types";
import { ErrorCollector } from "./Errors";
import {
  TEMPLATE_HEADER_KEYS,
  ALLOWED_EXTENSIONS,
  MAX_ROWS,
  VALIDATION_MESSAGES,
} from "./Constants";
import { normalizeString } from "./Utils";

/**
 * Parsed Excel structure.
 * Phase 2: Replace this with xlsx read output.
 */
export interface ParsedExcel {
  /** Template metadata from row 1 */
  header: TemplateHeader;
  /** Column headers from row 2 */
  columns: string[];
  /** Data rows starting from row 3 */
  rows: Record<string, unknown>[];
  /** Raw filename */
  filename: string;
}

/**
 * Result of template header validation.
 */
export interface HeaderValidationResult {
  valid: boolean;
  errors: ImportError[];
  warnings: ImportWarning[];
  header: TemplateHeader | null;
}

/**
 * Result of column validation.
 */
export interface ColumnValidationResult {
  valid: boolean;
  errors: ImportError[];
  warnings: ImportWarning[];
  matchedColumns: string[];
  missingColumns: string[];
  extraColumns: string[];
}

/**
 * Result of the full parse operation.
 */
export interface ParseResult {
  valid: boolean;
  errors: ImportError[];
  warnings: ImportWarning[];
  rows: RawRow[];
  totalRows: number;
  validRows: number;
  errorRows: number;
}

/**
 * Parser for import templates.
 * Handles template header validation, column mapping, and row extraction.
 */
export class Parser {
  private collector = new ErrorCollector();

  /**
   * Parse a ParsedExcel structure.
   * Validates template headers, columns, and extracts rows.
   */
  parse(
    parsed: ParsedExcel,
    columnConfigs: ColumnConfig[],
    expectedModule: string,
    expectedVersion: string
  ): ParseResult {
    this.collector.clear();

    // 1. Validate template header
    const headerResult = this.validateHeader(
      parsed.header,
      expectedModule,
      expectedVersion
    );

    if (!headerResult.valid) {
      this.collector.addErrors(headerResult.errors);
      this.collector.addWarnings(headerResult.warnings);
      return {
        valid: false,
        errors: this.collector.getErrors(),
        warnings: this.collector.getWarnings(),
        rows: [],
        totalRows: 0,
        validRows: 0,
        errorRows: 0,
      };
    }

    // 2. Validate columns
    const columnResult = this.validateColumns(
      parsed.columns,
      columnConfigs
    );

    this.collector.addErrors(columnResult.errors);
    this.collector.addWarnings(columnResult.warnings);

    if (!columnResult.valid) {
      return {
        valid: false,
        errors: this.collector.getErrors(),
        warnings: this.collector.getWarnings(),
        rows: [],
        totalRows: 0,
        validRows: 0,
        errorRows: 0,
      };
    }

    // 3. Validate file constraints
    const fileErrors = this.validateFileConstraints(parsed);
    this.collector.addErrors(fileErrors);

    if (fileErrors.length > 0) {
      return {
        valid: false,
        errors: this.collector.getErrors(),
        warnings: this.collector.getWarnings(),
        rows: [],
        totalRows: 0,
        validRows: 0,
        errorRows: 0,
      };
    }

    // 4. Extract rows
    const extracted = this.extractRows(parsed.rows, parsed.columns, columnConfigs);

    // 4b. Inherit package-level fields across rows within the same package block.
    // Package fields may be provided only on the first row of a package;
    // subsequent section/item rows should carry them forward until the next package.
    const packageFields = [
      "package_name",
      "package_slug",
      "package_price",
      "package_description",
      "package_display_order",
      "package_is_active",
    ];
    let currentPackageName = "";
    let lastPackageValues: Record<string, unknown> = {};

    for (const row of extracted.rawRows) {
      const packageName = String(row.data.package_name || "").trim();

      if (packageName) {
        if (packageName !== currentPackageName) {
          currentPackageName = packageName;
          lastPackageValues = { ...row.data };
          continue;
        }
      }

      if (currentPackageName && packageName === currentPackageName) {
        for (const field of packageFields) {
          if (
            row.data[field] === null ||
            row.data[field] === undefined ||
            row.data[field] === ""
          ) {
            const inherited = lastPackageValues[field];
            if (
              inherited !== undefined &&
              inherited !== null &&
              inherited !== ""
            ) {
              row.data[field] = inherited;
            }
          }
        }
      }
    }

    return {
      valid: extracted.errors === 0,
      errors: this.collector.getErrors(),
      warnings: this.collector.getWarnings(),
      rows: extracted.rawRows,
      totalRows: extracted.rawRows.length,
      validRows: extracted.rawRows.filter((r) => r.isValid).length,
      errorRows: extracted.rawRows.filter((r) => !r.isValid).length,
    };
  }

  /**
   * Validate the template header row.
   * Checks module name and template version match.
   */
  validateHeader(
    header: TemplateHeader,
    expectedModule: string,
    expectedVersion: string
  ): HeaderValidationResult {
    const errors: ImportError[] = [];
    const warnings: ImportWarning[] = [];

    // Check module match
    if (
      header.module &&
      header.module.toLowerCase() !== expectedModule.toLowerCase()
    ) {
      errors.push({
        row: 0,
        column: "MODULE",
        message: VALIDATION_MESSAGES.MODULE_MISMATCH(
          expectedModule,
          header.module
        ),
        severity: "error",
      });
    }

    // Check template version compatibility (major version must match)
    if (header.templateVersion) {
      const expectedMajor = expectedVersion.split(".")[0];
      const actualMajor = header.templateVersion.split(".")[0];

      if (actualMajor !== expectedMajor) {
        errors.push({
          row: 0,
          column: "TEMPLATE_VERSION",
          message: VALIDATION_MESSAGES.TEMPLATE_VERSION_MISMATCH(
            `${expectedMajor}.x.x`,
            header.templateVersion
          ),
          severity: "error",
        });
      } else if (header.templateVersion !== expectedVersion) {
        // Minor/patch version mismatch is just a warning
        warnings.push({
          row: 0,
          message: `Template version ${header.templateVersion} differs from expected ${expectedVersion}. Continuing.`,
          severity: "warning",
        });
      }
    } else {
      warnings.push({
        row: 0,
        message: "Template version header not found. Continuing with caution.",
        severity: "warning",
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      header,
    };
  }

  /**
   * Validate columns against the expected column configs.
   */
  validateColumns(
    actualColumns: string[],
    expectedConfigs: ColumnConfig[]
  ): ColumnValidationResult {
    const errors: ImportError[] = [];
    const warnings: ImportWarning[] = [];

    // Build expected column labels and required flags
    const expectedLabels = expectedConfigs.map((c) => c.label);
    const requiredLabels = expectedConfigs
      .filter((c) => c.required)
      .map((c) => c.label);

    // Check for missing required columns
    const missingColumns: string[] = [];
    for (const requiredLabel of requiredLabels) {
      const match = actualColumns.some(
        (actual) => actual.toLowerCase() === requiredLabel.toLowerCase()
      );
      if (!match) {
        missingColumns.push(requiredLabel);
        errors.push({
          row: 0,
          column: requiredLabel,
          message: VALIDATION_MESSAGES.MISSING_REQUIRED_COLUMN(requiredLabel),
          severity: "error",
        });
      }
    }

    // Find matched columns (case-insensitive)
    const matchedColumns: string[] = [];
    for (const actual of actualColumns) {
      const match = expectedLabels.find(
        (expected) => expected.toLowerCase() === actual.toLowerCase()
      );
      if (match) {
        matchedColumns.push(match);
      }
    }

    // Check for extra unknown columns
    const extraColumns: string[] = [];
    for (const actual of actualColumns) {
      const match = expectedLabels.find(
        (expected) => expected.toLowerCase() === actual.toLowerCase()
      );
      if (!match) {
        extraColumns.push(actual);
        warnings.push({
          row: 0,
          message: VALIDATION_MESSAGES.EXTRA_UNKNOWN_COLUMN(actual),
          severity: "warning",
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      matchedColumns,
      missingColumns,
      extraColumns,
    };
  }

  /**
   * Validate file-level constraints (extension, size, row count).
   */
  validateFileConstraints(parsed: ParsedExcel): ImportError[] {
    const errors: ImportError[] = [];

    // Check file extension
    if (parsed.filename) {
      const ext = parsed.filename
        .toLowerCase()
        .slice(parsed.filename.lastIndexOf("."));
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        errors.push({
          row: 0,
          column: "FILE",
          message: VALIDATION_MESSAGES.INVALID_EXTENSION(),
          severity: "error",
        });
      }
    }

    // Check row count
    if (parsed.rows.length > MAX_ROWS) {
      errors.push({
        row: 0,
        column: "ROWS",
        message: `Maximum ${MAX_ROWS} rows per import. Found ${parsed.rows.length} rows.`,
        severity: "error",
      });
    }

    return errors;
  }

  /**
   * Extract rows from raw data, mapping columns to field names.
   * Handles column mapping (case-insensitive), blank row detection,
   * and basic type normalization.
   */
  private extractRows(
    rawRows: Record<string, unknown>[],
    excelColumns: string[],
    columnConfigs: ColumnConfig[]
  ): { rawRows: RawRow[]; errors: number } {
    const rows: RawRow[] = [];
    let errorCount = 0;

    // Build a column mapping: excel header → field name (case-insensitive)
    const columnMap = new Map<string, string>();
    for (const actual of excelColumns) {
      const config = columnConfigs.find(
        (c) => c.label.toLowerCase() === actual.toLowerCase()
      );
      if (config) {
        columnMap.set(actual, config.field);
      }
    }

    for (let i = 0; i < rawRows.length; i++) {
      const rawRow = rawRows[i];
      const rowNumber = i + 3; // Excel row number (1=header, 2=columns, 3+=data)
      const rowErrors: ImportError[] = [];
      const rowWarnings: ImportWarning[] = [];

      // Check for blank row
      const values = Object.values(rawRow).filter(
        (v) => v !== null && v !== undefined && v !== ""
      );
      if (values.length === 0) {
        rowWarnings.push({
          row: rowNumber,
          message: VALIDATION_MESSAGES.EMPTY_ROW,
          severity: "warning",
        });
        rows.push({
          rowNumber,
          data: {},
          isValid: true,
          errors: rowErrors,
          warnings: rowWarnings,
        });
        continue;
      }

      // Map Excel columns to field names
      const mappedData: Record<string, unknown> = {};
      for (const [excelCol, fieldName] of columnMap) {
        const rawValue = rawRow[excelCol];
        mappedData[fieldName] = rawValue !== undefined ? rawValue : null;
      }

      // Apply default values for missing fields
      for (const config of columnConfigs) {
        if (
          mappedData[config.field] === null ||
          mappedData[config.field] === undefined
        ) {
          if (config.default !== undefined) {
            mappedData[config.field] = config.default;
          }
        }
      }

      const isValid = rowErrors.length === 0;
      if (!isValid) errorCount++;

      rows.push({
        rowNumber,
        data: mappedData,
        isValid,
        errors: rowErrors,
        warnings: rowWarnings,
      });
    }

    // DEBUG: log first 5 rows for package import
    if (columnConfigs.some((c) => c.field.startsWith("package_"))) {
      console.log("[Parser][DEBUG] First 5 parsed rows:", JSON.stringify(rows.slice(0, 5), null, 2));
    }

    return { rawRows: rows, errors: errorCount };
  }

  /**
   * Extract the template header from a raw metadata object.
   */
  static extractHeader(
    metadata: Record<string, string>
  ): TemplateHeader {
    const keys = TEMPLATE_HEADER_KEYS;
    return {
      templateVersion: normalizeString(metadata[keys.VERSION] ?? ""),
      module: normalizeString(metadata[keys.MODULE] ?? ""),
      templateDate: normalizeString(metadata[keys.DATE] ?? ""),
      crmVersion: normalizeString(metadata[keys.CRM_VERSION] ?? ""),
    };
  }
}