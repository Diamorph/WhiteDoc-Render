export enum TemplateDocumentFieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATETIME = 'datetime',
  DROPDOWN = 'dropdown',
  DICTIONARY = 'select-dictionary',
  TABLE = 'table'
}

export enum TemplateDocumentFieldTypeToSelector {
  TEXT = 'app-document-field-text',
  NUMBER = 'app-document-field-text',
  DATETIME = 'app-document-field-datetime',
  DROPDOWN = 'dropdown', // todo: Add component for dropdown
  DICTIONARY = 'app-document-field-dropdown',
  TABLE = 'table', // todo: Add component for Table
}

export const templateDocumentFieldTypeKeys = Object.keys(TemplateDocumentFieldType);
