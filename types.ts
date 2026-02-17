export enum SchoolLevel {
  PRIMARY = 'प्राइमरी',
  UPPER_PRIMARY = 'अपर प्राइमरी',
  PEEO = 'PEEO',
  OTHER = 'अन्य विद्यालय'
}

export interface CookHelperStats {
  st_m: number; st_f: number;
  sc_m: number; sc_f: number;
  obc_m: number; obc_f: number;
  gen_m: number; gen_f: number;
}

export interface MasterData {
  // Section 1: School Profile
  schoolName: string;
  level: SchoolLevel;
  udiseCode: string;
  inchargeName: string;
  enroll_1_5: number;
  enroll_6_8: number;
  block: string;
  district: string;
  financialYear: string;

  // Section 2: Opening Balance
  openWheat15: number; openRice15: number; openMilk15: number; openConv15: number; openSugar15: number;
  openWheat68: number; openRice68: number; openMilk68: number; openConv68: number; openSugar68: number;

  // Section 3: Joint Openings
  openMilkCylinder: number;
  openCookHelper: number;
  openMilkHelper: number;

  // Section 4: Milk Helper Setup
  milkHelperCount: number;
  milkHelperSalary: number;

  // Section 5: Consumption Norms
  normConv15: number; normGrain15: number; normMilk15: number; normSugar15: number;
  normConv68: number; normGrain68: number; normMilk68: number; normSugar68: number;

  // Section 6: Cook Helper Table
  helpers: CookHelperStats;
  cookHelperSalary: number;

  // Section 7: Sugar Rate
  sugarRate: number;

  lastUpdated: string;
}

export interface DailyEntry {
  id: string;
  date: string;
  isHoliday: boolean;
  att_1_5: number;
  att_6_8: number;
  menuItem?: string;
  isMilkDistributed?: boolean;
}

export interface StockReceipt {
  id: string;
  date: string;
  item: 'WHEAT' | 'RICE' | 'MILK';
  amount: number;
  category: '1-5' | '6-8';
  transactionType: 'SUPPLIER' | 'BORROW_IN' | 'LEND_OUT' | 'REPAY_OUT' | 'RETURN_IN' | 'INTERNAL_TRANSFER';
  sourceSchool?: string;
  transferTarget?: '1-5' | '6-8'; // For internal transfers
}

export interface BudgetReceipt {
  id: string;
  date: string;
  amount: number;
  description: string;
}

export interface MonthlyExpenseRecord {
  id: string;
  month: number; // 0-11
  year: number;
  milkHelperAmt: number;
  cookHelperAmt: number;
  cylinderCount: number;
  cylinderAmt: number;
}

export type Page = 
  | 'DASHBOARD' 
  | 'MASTER' 
  | 'DAILY' 
  | 'STOCK' 
  | 'BUDGET' 
  | 'HISTORY' 
  | 'REPORT' 
  | 'MONTHLY_EXPENSE' 
  | 'BACKUP' 
  | 'HISTORY_MENU'
  | 'STOCK_HISTORY'
  | 'BUDGET_HISTORY'
  | 'EXPENSE_HISTORY';