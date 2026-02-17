import { MasterData, SchoolLevel } from './types';

export const INITIAL_MASTER_DATA: MasterData = {
  schoolName: '',
  level: SchoolLevel.UPPER_PRIMARY,
  udiseCode: '',
  inchargeName: '',
  enroll_1_5: 0,
  enroll_6_8: 0,
  block: '',
  district: '',
  financialYear: '2024-25',

  openWheat15: 0, openRice15: 0, openMilk15: 0, openConv15: 0, openSugar15: 0,
  openWheat68: 0, openRice68: 0, openMilk68: 0, openConv68: 0, openSugar68: 0,

  openMilkCylinder: 0,
  openCookHelper: 0,
  openMilkHelper: 0,

  milkHelperCount: 0,
  milkHelperSalary: 0,

  // Section 5 Norms (Default values as per prompt)
  normConv15: 6.78, normGrain15: 100, normMilk15: 15, normSugar15: 8.4,
  normConv68: 10.17, normGrain68: 150, normMilk68: 20, normSugar68: 10.2,

  helpers: {
    st_m: 0, st_f: 0, sc_m: 0, sc_f: 0, obc_m: 0, obc_f: 0, gen_m: 0, gen_f: 0
  },
  cookHelperSalary: 0,
  sugarRate: 40,
  lastUpdated: new Date().toISOString()
};
