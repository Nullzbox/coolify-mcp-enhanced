/**
 * Response formatter to handle large responses and ensure they stay within token limits
 */

const MAX_RESPONSE_SIZE = 20000; // Maximum characters for response
const MAX_ITEMS_DEFAULT = 50; // Default max items to return

export interface FormatterOptions {
  maxItems?: number;
  includeDetails?: boolean;
  fields?: string[];
}

export class ResponseFormatter {
  /**
   * Format a list response with pagination info
   */
  static formatList<T>(
    items: T[], 
    entityName: string, 
    options: FormatterOptions = {}
  ): any {
    const maxItems = options.maxItems || MAX_ITEMS_DEFAULT;
    const truncated = items.length > maxItems;
    const returnItems = truncated ? items.slice(0, maxItems) : items;
    
    // Create summary if needed
    const summary = returnItems.map((item: any) => {
      if (options.fields && options.fields.length > 0) {
        const summaryItem: any = {};
        options.fields.forEach(field => {
          if (item[field] !== undefined) {
            summaryItem[field] = item[field];
          }
        });
        return summaryItem;
      }
      
      // Default summary fields
      return {
        uuid: item.uuid || item.id,
        name: item.name || item.title || 'Unnamed',
        status: item.status,
        created_at: item.created_at,
        ...(options.includeDetails ? item : {})
      };
    });
    
    return {
      success: true,
      data: summary,
      pagination: {
        total: items.length,
        returned: returnItems.length,
        truncated,
        message: truncated 
          ? `Showing first ${maxItems} of ${items.length} ${entityName}. Use pagination or filtering to see more.`
          : `Showing all ${items.length} ${entityName}`
      }
    };
  }
  
  /**
   * Format a single item response
   */
  static formatSingle<T>(item: T, entityName: string): any {
    return {
      success: true,
      data: item,
      message: `Successfully retrieved ${entityName}`
    };
  }
  
  /**
   * Format an error response
   */
  static formatError(error: any, operation: string): any {
    const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';
    const errorDetails = error?.response?.data || error?.data || null;
    
    return {
      success: false,
      error: {
        message: errorMessage,
        operation,
        details: errorDetails,
        timestamp: new Date().toISOString()
      }
    };
  }
  
  /**
   * Safely stringify response ensuring it doesn't exceed max size
   */
  static stringify(data: any): string {
    let result = JSON.stringify(data, null, 2);
    
    if (result.length > MAX_RESPONSE_SIZE) {
      // Try to reduce size by removing some data
      if (data.data && Array.isArray(data.data)) {
        const reducedData = {
          ...data,
          data: data.data.slice(0, 10),
          pagination: {
            ...data.pagination,
            truncated: true,
            message: `Response too large. Showing only first 10 items. Original count: ${data.data.length}`
          }
        };
        result = JSON.stringify(reducedData, null, 2);
      } else {
        // For single items, truncate details
        result = JSON.stringify({
          success: data.success,
          error: data.error || 'Response too large to display',
          message: 'Response truncated due to size limits. Use specific queries to get detailed information.'
        }, null, 2);
      }
    }
    
    return result;
  }
}

/**
 * Helper function to safely format MCP tool responses
 */
export function formatToolResponse(data: any): { content: Array<{ type: string; text: string }> } {
  return {
    content: [{
      type: 'text',
      text: ResponseFormatter.stringify(data)
    }]
  };
}