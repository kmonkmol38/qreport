
export const STORAGE_KEY = 'smart_qr_employees_v7';
export const LAST_SYNC_KEY = 'smart_qr_last_sync_v7';

// Base URL for the bucket. Chunks will be appended as /chunk_0, /chunk_1, etc.
export const SYNC_BASE_URL = 'https://kvdb.io/MN8x9v6w4q2p5r1t7y3z/employee_master_v7';
export const SYNC_URL = `${SYNC_BASE_URL}_manifest`;

export const EXCEL_HEADERS = {
  EMPLOYEE_ID: 'Empoyee_ID', 
  EMPLOYEE_NAME: 'Employee_Name',
  MEAL_TYPE: 'Meal_Type',
  COMPANY_NAME: 'Company_Name',
  CAMP_ALLOCATION: 'Camp_Allocation',
  ACCESS_CARD: 'Access_Card',
  CARD_NUMBER: 'Card_Number'
};

export const SYNC_INTERVAL_MS = 20000; // Increased interval to be more gentle with multiple chunk requests
