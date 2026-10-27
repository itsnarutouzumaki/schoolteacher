const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'src/data/teacher-mock-data.json'),'utf8'));
const config=JSON.parse(fs.readFileSync(path.join(root,'src/data/school-config.json'),'utf8'));
const errors=[];
if(!data.teacher?.id||!data.teacher?.name)errors.push('Teacher seed profile is incomplete.');
if(!data.classes.length)errors.push('No class sections are configured.');
const studentIds=new Set(),studentCodes=new Set();let studentCount=0;
for(const [key,students] of Object.entries(data.studentsByClass)){if(!students.length)errors.push(`Empty roster ${key}`);for(const s of students){studentCount++;if(studentIds.has(s.id))errors.push(`Duplicate student ID ${s.id}`);studentIds.add(s.id);if(studentCodes.has(s.studentId))errors.push(`Duplicate student code ${s.studentId}`);studentCodes.add(s.studentId);if(`${s.className}|${s.section}`!==key)errors.push(`Student ${s.id} is in a mismatched roster ${key}`);if(!s.fatherName||!s.rollNumber||!s.studentId)errors.push(`Student ${s.id} misses required attendance identity fields`);}}
const resultIds=new Set();for(const result of data.previousResults){if(resultIds.has(result.id))errors.push(`Duplicate result ID ${result.id}`);resultIds.add(result.id);if(!result.entries.length)errors.push(`Result ${result.id} has no entries`);const rollNums=new Set();for(const entry of result.entries){if(!studentIds.has(entry.studentId))errors.push(`Result ${result.id} references missing student ${entry.studentId}`);if(rollNums.has(entry.rollNumber))errors.push(`Duplicate roll ${entry.rollNumber} in ${result.id}`);rollNums.add(entry.rollNumber);if(entry.obtainedMarks<0||entry.obtainedMarks>entry.totalMarks)errors.push(`Invalid marks in ${result.id} for ${entry.studentId}`);}}
for(const cls of data.classes){if(!data.studentsByClass[`${cls.className}|${cls.section}`])errors.push(`Class section has no roster: ${cls.label}`);}
for(const n of data.notifications){if(!n.title||!n.message||!n.titleHi||!n.messageHi||!n.dateLabelHi)errors.push(`Notification ${n.id} is missing bilingual sample copy.`);}
if(!config.school?.aboutHi||!config.school?.missionHi||!Array.isArray(config.school?.facilitiesHi))errors.push('School config needs Hindi about, mission and facilities content.');
if(!config.school?.name||!config.school?.heroPhotoUrl)errors.push('School config is missing brand name or hero photo.');
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`Mock-data checks passed: ${data.classes.length} class sections, ${studentCount} students, ${data.previousResults.length} historical result sets and ${resultIds.size} unique result IDs.`);
