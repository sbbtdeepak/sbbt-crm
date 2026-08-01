import io
import os

path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "App", "quote", "page.tsx")
with io.open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add Link import
content = content.replace(
    "import { useState, Suspense } from 'react';",
    "import Link from 'next/link';\nimport { useState, Suspense } from 'react';",
    1,
)

# 2. Fix ternary spacing in remarks (plotArea? -> plotArea ?)
content = content.replace("plotArea? `", "plotArea ? `")

# 3. Fix submit button ternary spacing
content = content.replace(
    "{isSubmitting? 'Submitting.': 'Submit Quote Request'}",
    "{isSubmitting ? 'Submitting...' : 'Submit Quote Request'}",
)

# 4. Replace broken <href tag with Link component (fixes broken element + lint)
content = content.replace(
    '<href="/" className="mt-4 inline-block text-indigo-600 hover:underline">\nGo back to Home\n</a>',
    '<Link href="/" className="mt-4 inline-block text-indigo-600 hover:underline">\nGo back to Home\n</Link>',
)

# 5. Fix apostrophe lint errors by replacing with {} expressions
content = content.replace(
    "<p className=\"text-gray-600 mt-2\">We'll get back to you shortly.</p>",
    '<p className="text-gray-600 mt-2">{"We\\' + "'" + 'll get back to you shortly."}</p>',
)
content = content.replace(
    "Tell us about your project and we'll get back to you shortly.",
    'Tell us about your project and {"we\\' + "'" + 'll"} get back to you shortly.',
)

with io.open(path, "w", encoding="utf-8", newline="") as f:
    f.write(content)

print("Quote page fixes applied.")