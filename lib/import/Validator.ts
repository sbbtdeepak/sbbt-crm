// ============================================================
// Enterprise Import Framework v1.0 — Validator
// SBBT CRM v2
//
// Row-level validation: checks each row against column configs,
// type constraints, required fields, and business rules.
// ============================================================

import type { ColumnConfig, ValidatedRow, RawRow, ImportError, ImportWarning } from "./Types";
import { ErrorCollector } from "./Errors";
import {
  normalizeString,
  parseBoolean,
  parseDateDDMMYYYY,
  isValidUrl,
  isValidEmail,
  isValidNumber,
  isValidInteger,
} from "./Utils";
import { VALIDATION_MESSAGES } from "./Constants";

export interface ValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  errorRows: number;
  rows: ValidatedRow[];
  errors: ImportError[];
  warnings: ImportWarning[];
}

export interface ValidationOptions {
  identityFields?: string[];
  existingKeys?: Set<string>;
}

export class Validator {
  private collector = new ErrorCollector();

  validate(
    rawRows: RawRow[],
    columnConfigs: ColumnConfig[],
    options: ValidationOptions = {}
  ): ValidationResult {
    this.collector.clear();
    const validatedRows: ValidatedRow[] = [];
    const { identityFields = [], existingKeys = new Set() } = options;
    const seenKeys = new Map<string, number>();

    for (const rawRow of rawRows) {
      const rowErrors: ImportError[] = [];
      const rowWarnings: ImportWarning[] = [];

      // Skip empty rows
      if (Object.keys(rawRow.data).length === 0) {
        validatedRows.push({
          rowNumber: rawRow.rowNumber,
          data: rawRow.data,
          action: "skip",
          reason: "Empty row",
          errors: [],
          warnings: [],
        });
        continue;
      }

      const validatedData: Record<string, unknown> = {};

      for (const config of columnConfigs) {
        const value = rawRow.data[config.field];
        const fieldLabel = config.label;

        // Required field check
        if (config.required && (value === null || value === undefined || value === "")) {
          rowErrors.push({
            row: rawRow.rowNumber,
            column: fieldLabel,
            message: VALIDATION_MESSAGES.REQUIRED_FIELD(fieldLabel),
            severity: "error",
          });
          continue;
        }

        // Skip validation for empty optional fields
        if (value === null || value === undefined || value === "") {
          validatedData[config.field] = null;
          continue;
        }

        // Type validation
        const validated = this.validateField(value, config, rawRow.rowNumber);
        if (validated.error) {
          rowErrors.push(validated.error);
        }
        validatedData[config.field] = validated.value;
      }

      // Identity field duplicate check (within file)
      if (identityFields.length > 0) {
        const key = identityFields.map((f) => String(validatedData[f] ?? "")).join("::");
        if (key) {
          const existingRow = seenKeys.get(key);
          if (existingRow) {
            rowErrors.push({
              row: rawRow.rowNumber,
              column: identityFields[0],
              message: VALIDATION_MESSAGES.DUPLICATE_IN_FILE(key),
              severity: "error",
            });
          }
          seenKeys.set(key, rawRow.rowNumber);
        }
      }

      const isValid = rowErrors.length === 0;

      // Determine action
      let action: "insert" | "update" | "skip" = "insert";
      let reason = "";

      if (!isValid) {
        action = "skip";
        reason = "Validation errors";
      } else if (identityFields.length > 0) {
        const key = identityFields.map((f) => String(validatedData[f] ?? "")).join("::");
        if (existingKeys.has(key)) {
          action = "update";
          reason = "Existing record found";
        }
      }

      validatedRows.push({
        rowNumber: rawRow.rowNumber,
        data: validatedData,
        action,
        reason,
        errors: rowErrors,
        warnings: rowWarnings,
      });
    }

    const errorRows = validatedRows.filter((r) => r.errors.length > 0).length;
    const validRows = validatedRows.filter((r) => r.errors.length === 0).length;

    return {
      isValid: errorRows === 0,
      totalRows: validatedRows.length,
      validRows,
      errorRows,
      rows: validatedRows,
      errors: this.collector.getErrors(),
      warnings: this.collector.getWarnings(),
    };
  }

  private validateField(
    value: unknown,
    config: ColumnConfig,
    rowNumber: number
  ): { value: unknown; error?: ImportError } {
    const fieldLabel = config.label;

    switch (config.type) {
      case "text": {
        const str = normalizeString(value);
        if (config.maxLength && str.length > config.maxLength) {
          return {
            value: null,
            error: {
              row: rowNumber,
              column: fieldLabel,
              message: VALIDATION_MESSAGES.MAX_LENGTH(fieldLabel, config.maxLength),
              severity: "error",
            },
          };
        }
        if (config.minLength && str.length > 0 && str.length < config.minLength) {
          return {
            value: null,
            error: {
              row: rowNumber,
              column: fieldLabel,
              message: VALIDATION_MESSAGES.MIN_LENGTH(fieldLabel, config.minLength),
              severity: "error",
            },
          };
        }
        if (config.pattern && !config.pattern.test(str)) {
          return {
            value: null,
            error: {
              row: rowNumber,
              column: fieldLabel,
              message: `Invalid format for "${fieldLabel}"`,
              severity: "error",
            },
          };
        }
        return { value: str };
      }

      case "number": {
        if (!isValidNumber(value)) {
          return {
            value: null,
            error: {
              row: rowNumber,
              column: fieldLabel,
              message: VALIDATION_MESSAGES.INVALID_NUMBER(fieldLabel),
              severity: "error",
            },
          };
        }
        const num = Number(value);
        if (config.min !== undefined && num < config.min) {
          return {
            value: null,
            error: {
              row: rowNumber,
              column: fieldLabel,
              message: VALIDATION_MESSAGES.OUT_OF_RANGE(fieldLabel, config.min, config.max ?? Infinity),
              severity: "error",
            },
          };
        }
        if (config.max !== undefined && num > config.max) {
          return {
            value: null,
            error: {
              row: rowNumber,
              column: fieldLabel,
              message: VALIDATION_MESSAGES.OUT_OF_RANGE(fieldLabel, config.min ?? 0, config.max),
              severity: "error",
            },
          };
        }
        return { value: num };
      }

      case "integer": {
        if (!isValidInteger(value)) {
          return {
            value: null,
            error: {
              row: rowNumber,
              column: fieldLabel,
              message: VALIDATION_MESSAGES.INVALID_INTEGER(fieldLabel),
              severity: "error",
            },
          };
        }
        const intVal = parseInt(String(value), 10);
        if (config.min !== undefined && intVal < config.min) {
          return {
            value: null,
            error: {
              row: rowNumber,
              column: fieldLabel,
              message: VALIDATION_MESSAGES.OUT_OF_RANGE(fieldLabel, config.min, config.max ?? Infinity),
              severity: "error",
            },
          };
        }
        if (config.max !== undefined && intVal > config.max) {
          return {
            value: null,
            error: {
              row: rowNumber,
              column: fieldLabel,
              message: VALIDATION_MESSAGES.OUT_OF_RANGE(fieldLabel, config.min ?? 0, config.max),
              severity: "error",
            },
          };
        }
        return { value: intVal };
      }

      case "boolean": {
        const boolVal = parseBoolean(value);
        if (boolVal === undefined) {
          return {
            value: null,
            error: {
              row: rowNumber,
              column: fieldLabel,
              message: VALIDATION_MESSAGES.INVALID_BOOLEAN(fieldLabel),
              severity: "error",
            },
          };
        }
        return { value: boolVal };
      }

      case "date": {
        const dateVal = parseDateDDMMYYYY(value);
        if (!dateVal) {
          return {
            value: null,
            error: {
              row: rowNumber,
              column: fieldLabel,
              message: VALIDATION_MESSAGES.INVALID_DATE(fieldLabel),
              severity: "error",
            },
          };
        }
        return { value: dateVal.toISOString().split("T")[0] };
      }

      case "url": {
        if (!isValidUrl(value)) {
          return {
            value: null,
            error: {
              row: rowNumber,
              column: fieldLabel,
              message: VALIDATION_MESSAGES.INVALID_URL(fieldLabel),
              severity: "error",
            },
          };
        }
        return { value: normalizeString(value) };
      }

      case "email": {
        if (!isValidEmail(value)) {
          return {
            value: null,
            error: {
              row: rowNumber,
              column: fieldLabel,
              message: VALIDATION_MESSAGES.INVALID_EMAIL(fieldLabel),
              severity: "error",
            },
          };
        }
        return { value: normalizeString(value) };
      }

      case "enum": {
        const str = normalizeString(value);
        if (config.enum && !config.enum.includes(str)) {
          return {
            value: null,
            error: {
              row: rowNumber,
              column: fieldLabel,
              message: VALIDATION_MESSAGES.INVALID_ENUM(fieldLabel, config.enum),
              severity: "error",
            },
          };
        }
        return { value: str };
      }

      default:
        return { value: normalizeString(value) };
    }
  }
}