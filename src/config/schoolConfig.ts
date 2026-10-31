import schoolConfig from "../../../shared/school-config.json";

export type SchoolConfiguration = typeof schoolConfig;

export function getSchoolConfiguration(): SchoolConfiguration {
  return schoolConfig;
}
