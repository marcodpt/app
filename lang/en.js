export default {
  ERROR_TITLE: 'Error',
  ERROR_AUTHENTICATION: [
    'Authentication failed!',
    'Make sure the username and password are correct!'
  ],
  ERROR_UNAUTHORIZED: [
    'Session has expired!',
    'Please login again!'
  ],
  ERROR_FORBIDDEN: 'Access denied!',
  ERROR_NOT_FOUND: 'Page not found!',
  ERROR_INTERNAL_SERVER_ERROR: [
    'Failed to perform action!',
    'Please check the system logs!'
  ],
  ERROR_CONNECTION: [
    'Failed to connect to server!',
    'Make sure your internet connection is active!'
  ],
  BACK_LABEL: 'Back',
  SUBMIT_LABEL: 'Submit',
  PAGINATION_LABEL: (page, pages) => `Page ${page} of ${pages}`,
  SEARCH_LABEL: 'Search',
  FILTER_LABEL: 'Filter',
  GROUP_LABEL: 'Group',
  CSV_LABEL: 'Export'
}
