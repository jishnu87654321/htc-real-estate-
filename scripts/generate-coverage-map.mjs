import fs from "fs";
import path from "path";

function findFiles(dir, filter) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(fullPath, filter));
    } else if (filter(fullPath)) {
      results.push(fullPath);
    }
  });
  return results;
}

const pageFiles = findFiles("app", (f) => f.endsWith("page.tsx"));
const routes = pageFiles.map((p) => {
  const rel = p.replace(/^app/, "").replace(/[\\\/]page\.tsx$/, "").replace(/\\/g, "/");
  return rel === "" ? "/" : rel;
}).sort();

const apiRouteFiles = findFiles("app/api", (f) => f.endsWith("route.ts"));
const apiRoutes = apiRouteFiles.map((p) => {
  return p.replace(/^app/, "").replace(/[\\\/]route\.ts$/, "").replace(/\\/g, "/");
}).sort();

const actionFiles = findFiles("app/actions", (f) => f.endsWith(".ts"));
const schemaFiles = fs.readdirSync("lib/db/schema").filter((f) => f.endsWith(".ts"));

let md = `# HTC Codebase & Architecture Coverage Map\n\n`;
md += `Generated: ${new Date().toISOString()}\n\n`;

md += `## 1. Public & Authenticated Page Routes\n\n`;
routes.forEach((r) => {
  md += `- \`${r}\`\n`;
});

md += `\n## 2. API Route Handlers\n\n`;
apiRoutes.forEach((r) => {
  md += `- \`${r}\`\n`;
});

md += `\n## 3. Server Actions & Mutation Entry Points\n\n`;
actionFiles.forEach((f) => {
  const content = fs.readFileSync(f, "utf8");
  const exports = content.match(/export (?:async )?function ([a-zA-Z0-9_]+)/g) || [];
  md += `### ${f.replace(/\\/g, "/")}\n`;
  exports.forEach((e) => {
    md += `- \`${e.replace("export async function ", "").replace("export function ", "")}\`\n`;
  });
  md += `\n`;
});

md += `## 4. Database Schema Tables\n\n`;
schemaFiles.forEach((f) => {
  md += `- \`lib/db/schema/${f}\`\n`;
});

md += `\n## 5. End-to-End Feature Trace Matrix\n\n`;
md += `| # | Feature Area | Public Entry Point | Mutation Action / Handler | Backend Service | Primary DB Table(s) | Admin Panel Section | User Account Section |\n`;
md += `|---|---|---|---|---|---|---|---|\n`;
md += `| 1 | General & Home Inquiries | \`/contact\`, \`/properties/[slug]\` | \`submitEnquiryAction\` | \`createEnquiry\` | \`enquiries\`, \`status_events\` | \`/admin/enquiries\` | N/A (Visitor) |\n`;
md += `| 2 | Owner Property Submission | \`/list-your-property\` | \`submitOwnerSubmissionAction\` | \`createOwnerSubmission\` | \`owner_submissions\`, \`status_events\` | \`/admin/submissions\` | \`/account\` (My Submissions) |\n`;
md += `| 3 | Society Walkthrough Request | \`/communities\` | \`submitWalkthroughAction\` | \`createWalkthroughRequest\` | \`walkthrough_requests\`, \`status_events\` | \`/admin/walkthroughs\` | N/A |\n`;
md += `| 4 | Rental/Buy Application | \`/properties/[slug]\` (Modal) | \`submitApplicationAction\` | \`createApplication\` | \`applications\`, \`status_events\` | \`/admin/applications\` | \`/account\` (My Applications) |\n`;
md += `| 5 | Application State Transitions | \`/admin/applications\` | \`adminUpdateApplicationStatusAction\` | \`transitionApplicationStatus\` | \`applications\`, \`listings\`, \`status_events\`, \`audit_log\` | \`/admin/applications\` | \`/account\` (Realtime sync) |\n`;
md += `| 6 | Owner Submission Approval | \`/admin/submissions\` | \`adminUpdateSubmissionStatusAction\` | \`transitionSubmissionStatus\` | \`owner_submissions\`, \`listings\`, \`audit_log\` | \`/admin/submissions\` -> \`/admin/listings\` | \`/account\` (My Submissions) |\n`;
md += `| 7 | Walkthrough Scheduling | \`/admin/walkthroughs\` | \`adminUpdateWalkthroughStatusAction\` | \`updateWalkthroughStatus\` | \`walkthrough_requests\`, \`status_events\` | \`/admin/walkthroughs\` | N/A |\n`;
md += `| 8 | Saved Homes / Bookmarks | \`/properties/[slug]\`, \`/properties\` | \`toggleSaveListingAction\` | Direct Drizzle Query | \`saved_listings\` | N/A | \`/account\` (Saved Homes) |\n`;
md += `| 9 | Authentication & Session | \`/login\`, \`/signup\`, \`/api/auth/*\` | Better Auth SDK & Server Handlers | Better Auth Drizzle Adapter | \`user\`, \`session\`, \`account\`, \`rate_limits\` | \`/admin/users\` | \`/account\` (Profile) |\n`;
md += `| 10 | Staff Internal Notes | \`/admin/*\` (Detail Drawers) | \`adminAddNoteAction\` | Direct Drizzle Query | \`notes\` | \`/admin/*\` (Drawers) | N/A (Staff Only) |\n`;
md += `| 11 | Staff Lead Assignment | \`/admin/*\` (Detail Drawers) | \`adminAssignEntityAction\` | Direct Drizzle Query | \`applications\`, \`enquiries\`, \`owner_submissions\`, \`walkthrough_requests\` | \`/admin/*\` | N/A |\n`;
md += `| 12 | RBAC & User Management | \`/admin/users\` | \`adminUpdateUserRoleAction\` | Direct Drizzle Query | \`user\`, \`audit_log\` | \`/admin/users\` | \`/account\` |\n`;
md += `| 13 | Security & Audit Trail | \`/admin/activity\` | Automated audit logging | \`auditLog\` service | \`audit_log\` | \`/admin/activity\` | N/A |\n`;

fs.writeFileSync("docs/audit/COVERAGE-MAP.md", md);
console.log("Coverage map generated at docs/audit/COVERAGE-MAP.md");
