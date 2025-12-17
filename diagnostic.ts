import { LineupSchema } from "./src/domain/fantasy/models.js";
import { zodToJsonSchema } from "zod-to-json-schema";

console.log("=== LineupSchema Diagnostics ===\n");

console.log("1. LineupSchema object:");
console.log(LineupSchema);

console.log("\n2. LineupSchema type:");
console.log(typeof LineupSchema);

console.log("\n3. Has _def property:");
console.log("_def" in LineupSchema);

console.log("\n4. _def content:");
console.log((LineupSchema as any)._def);

console.log("\n5. Type name:");
console.log((LineupSchema as any)._def?.typeName);

console.log("\n6. Shape:");
console.log((LineupSchema as any)._def?.shape);

console.log("\n7. Direct zodToJsonSchema call:");
const directConversion = zodToJsonSchema(LineupSchema as any, "test_schema");
console.log(JSON.stringify(directConversion, null, 2));

console.log("\n8. Test parse:");
try {
  const testData = {
    formation: "433",
    starters: Array(11).fill("test-player"),
    bench: ["bench-player"],
    rationale: "Test rationale"
  };
  const parsed = LineupSchema.parse(testData);
  console.log("Parse successful:", parsed);
} catch (e) {
  console.log("Parse failed:", e);
}