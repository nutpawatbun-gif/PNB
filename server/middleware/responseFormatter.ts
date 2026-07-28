import { Request, Response, NextFunction } from 'express';

export function sendStandardResponse(
  res: Response,
  statusCode: number,
  payload: {
    success: boolean;
    data?: any;
    meta?: any;
    error?: { code: string; message: string; details?: any };
  }
) {
  const requestId = (res.req as any)?.requestId || 'req_' + Date.now();
  res.status(statusCode).json({
    success: payload.success,
    data: payload.data,
    meta: payload.meta,
    error: payload.error,
    timestamp: new Date().toISOString(),
    requestId
  });
}

export function validatePayload(
  data: any,
  rules: {
    required?: string[];
    types?: Record<string, 'string' | 'number' | 'boolean' | 'object' | 'array'>;
    minLengths?: Record<string, number>;
    enums?: Record<string, any[]>;
  }
) {
  const errors: Array<{ field: string; message: string }> = [];

  if (!data || typeof data !== 'object') {
    return [{ field: 'body', message: 'Payload body ต้องเป็น JSON Object ที่ถูกต้อง' }];
  }

  if (rules.required) {
    for (const field of rules.required) {
      if (data[field] === undefined || data[field] === null || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors.push({ field, message: `จำเป็นต้องระบุข้อมูลช่อง '${field}'` });
      }
    }
  }

  if (rules.types) {
    for (const [field, expectedType] of Object.entries(rules.types)) {
      if (data[field] !== undefined && data[field] !== null) {
        if (expectedType === 'array') {
          if (!Array.isArray(data[field])) {
            errors.push({ field, message: `ข้อมูลช่อง '${field}' ต้องเป็น Array` });
          }
        } else if (typeof data[field] !== expectedType) {
          errors.push({ field, message: `ประเภทข้อมูลของ '${field}' ไม่ถูกต้อง (คาดหวัง: ${expectedType})` });
        }
      }
    }
  }

  if (rules.minLengths) {
    for (const [field, minLen] of Object.entries(rules.minLengths)) {
      if (typeof data[field] === 'string' && data[field].length < minLen) {
        errors.push({ field, message: `ช่อง '${field}' ต้องมีความยาวอย่างน้อย ${minLen} ตัวอักษร` });
      }
    }
  }

  if (rules.enums) {
    for (const [field, allowedValues] of Object.entries(rules.enums)) {
      if (data[field] !== undefined && data[field] !== null) {
        if (!allowedValues.includes(data[field])) {
          errors.push({ field, message: `ค่าของ '${field}' ต้องเป็นหนึ่งใน: ${allowedValues.join(', ')}` });
        }
      }
    }
  }

  return errors;
}

export function applyPaginationSearchSortFilter(
  items: any[],
  req: Request,
  searchableFields: string[] = ['title_th', 'title', 'name_th', 'name', 'code', 'content_th', 'body_th'],
  filterableFields: string[] = ['category', 'status', 'department', 'year', 'degree_level']
) {
  let result = [...items];

  // Filter
  for (const field of filterableFields) {
    const val = req.query[field];
    if (val !== undefined && val !== null && val !== '' && val !== 'all') {
      result = result.filter(item => {
        const itemVal = item[field];
        return String(itemVal).toLowerCase() === String(val).toLowerCase();
      });
    }
  }

  // Search
  const search = (req.query.search || req.query.q || '').toString().trim().toLowerCase();
  if (search) {
    result = result.filter(item => {
      return searchableFields.some(field => {
        const val = item[field];
        if (!val) return false;
        return String(val).toLowerCase().includes(search);
      });
    });
  }

  // Sort
  const sortBy = (req.query.sortBy || req.query.sort || 'created_at').toString();
  const sortOrder = (req.query.sortOrder || req.query.order || 'desc').toString().toLowerCase();

  result.sort((a, b) => {
    let valA = a[sortBy] ?? a.createdAt ?? a.created_at ?? a.id;
    let valB = b[sortBy] ?? b.createdAt ?? b.created_at ?? b.id;

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '20', 10)));
  const total = result.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedItems = result.slice(startIndex, startIndex + limit);

  return {
    items: paginatedItems,
    meta: {
      page,
      limit,
      total,
      totalPages,
      search: search || null,
      sortBy,
      sortOrder
    }
  };
}
