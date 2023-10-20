// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// export const environment = {

//   production: false,
//   server: "http://7163-49028.el-alt.com/api/",
//   resources: "http://7163-49028.el-alt.com/Resources/",
//   apiUrl: 'https://www.primefaces.org/data/customers'
// };
export const environment = {
  production: false,
  server: "https://localhost:44383/api/",
  // resources: "https://demoapi.pranavsoft.com/Resources/",
  resources: "https://localhost:44383/Resources/",
  apiUrl: "https://www.primefaces.org/data/customers",
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
