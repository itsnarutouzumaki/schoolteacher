const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Module = require('module');
let ts;
try { ts = require('typescript'); }
catch { ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript'); }
const root = path.resolve(__dirname, '..');
require.extensions['.ts'] = (loadedModule, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021, resolveJsonModule: true, esModuleInterop: true } }).outputText;
  loadedModule._compile(compiled, filename);
};
const servicePath = path.join(root, 'src/services/teacherService.ts');
const service = require(servicePath);
const notificationService = require(path.join(root, 'src/services/notificationPayload.ts'));
const config = JSON.parse(fs.readFileSync(path.resolve(root, '..', 'shared/school-config.json'), 'utf8'));
const seed = JSON.parse(fs.readFileSync(path.join(root, 'src/data/teacher-mock-data.json'), 'utf8'));

const attendance = service.makeAttendanceDraft('Class 5', 'A');
assert(attendance.students.length > 0, 'attendance roster should not be empty');
assert.equal(Object.keys(attendance.statuses).length, attendance.students.length, 'every student should have a status');
assert(attendance.students.every(student => attendance.statuses[student.id] === 'unmarked'), 'new attendance statuses must all start unmarked');
assert(/^\d{4}-\d{2}-\d{2}$/.test(attendance.date), 'attendance date should be local ISO date');

const resultDraft = service.makeResultDraft('Class 5', 'A', 'Mathematics', 'Logic Test');
assert.equal(resultDraft.students.length, Object.keys(resultDraft.entries).length, 'result draft must include an entry per student');
assert.equal(resultDraft.subject, 'Mathematics');
assert.equal(resultDraft.testName, 'Logic Test');
const student = resultDraft.students[0];
const blank = resultDraft.entries[student.id];
assert.equal(service.validateResultEntry(blank).reason, 'totalRequired', 'blank marks should fail validation');
assert.equal(service.validateResultEntry({ ...blank, totalMarks: '20', obtainedMarks: '18' }).valid, true, 'valid marks should pass');
assert.equal(service.validateResultEntry({ ...blank, totalMarks: '20', obtainedMarks: '21' }).reason, 'marksInvalid', 'marks above total should fail');
assert.equal(service.validateResultEntry({ ...blank, totalMarks: '0', obtainedMarks: '0' }).reason, 'totalMustPositive', 'zero max marks should fail');
assert.throws(() => service.draftToSavedResult(resultDraft), /Marks are incomplete or invalid/, 'draft conversion must reject incomplete marks');

const submitted = { ...resultDraft, entries: Object.fromEntries(resultDraft.students.map((item, index) => [item.id, { ...resultDraft.entries[item.id], totalMarks: '20', obtainedMarks: String(index % 21), remarks: '' }])) };
const saved = service.draftToSavedResult(submitted);
assert.equal(saved.totalStudents, resultDraft.students.length);
assert(saved.entries.every(entry => typeof entry.obtainedMarks === 'number' && entry.obtainedMarks >= 0 && entry.obtainedMarks <= entry.totalMarks));
assert.equal(service.resultStatistics(saved).totalStudents, saved.entries.length);
assert.equal(service.resultStatistics(saved).maxMarks, 20, 'statistics should show the maximum test marks, not a per-student sum');
assert.equal(service.sortResultEntries(saved, 'roll')[0].rollNumber, Math.min(...saved.entries.map(entry => entry.rollNumber)));
assert.equal(service.sortResultEntries(saved, 'marks')[0].obtainedMarks, Math.max(...saved.entries.map(entry => entry.obtainedMarks)));
assert.equal(service.getSubjects('Class 5').length > 0, true);
assert.equal(seed.classes.length > 0, true);
assert.equal(config.academic.defaultAcademicYear, resultDraft.academicYear);
const remoteNotice = notificationService.normalizeRemoteNotification({
  messageId: 'message-123',
  notification: { title: 'School closed', body: 'Classes are cancelled today.' },
  data: { eventId: 'event-123', type: 'general', route: 'Home', routeParams: '{"date":"2026-10-31"}' },
}, Date.parse('2026-10-31T12:00:00Z'));
assert.equal(remoteNotice.id, 'event-123');
assert.equal(remoteNotice.title, 'School closed', 'FCM notification subject should become the displayed title');
assert.equal(remoteNotice.message, 'Classes are cancelled today.', 'FCM body should be retained');
assert.equal(remoteNotice.route, 'Home');
assert.equal(notificationService.notificationRoute(remoteNotice).params.date, '2026-10-31');
assert.equal(notificationService.normalizeRemoteNotification({ data: { subject: 'Meeting', message: 'Starts at 10.' } }).title, 'Meeting');
assert.equal(notificationService.normalizeRemoteNotification({ data: { subject: 'Meeting', message: 'Starts at 10.' } }).message, 'Starts at 10.');
assert.equal(notificationService.normalizeRemoteNotification({ data: { route: 'Login' } }).route, undefined, 'untrusted payload routes must be rejected');
assert.equal(notificationService.notificationRoute(remoteNotice).name, 'Home');
assert.equal(notificationService.notificationRoute({ ...remoteNotice, route: undefined }).name, 'Notifications');
assert.equal(notificationService.mergeNotificationRecords([remoteNotice], [{ ...remoteNotice, read: true }])[0].read, true);
assert.equal(notificationService.createLocalTestNotification(1000).source, 'local');
console.log('Logic smoke tests passed: attendance, results, push payload normalization, safe routes, deduplication and local notification records.');
