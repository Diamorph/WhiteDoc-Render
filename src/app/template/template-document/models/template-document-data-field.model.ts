import {TemplateDocumentFieldType} from '../../../core/template-document-field';

export class TemplateDocumentDataField {
  name: string;
  type: TemplateDocumentFieldType;
  roleId: string;
  placeholder: string;
  attributes: Map<string, string|boolean|number> = new Map<string, string|boolean|number>();
  constructor(name: string, type: TemplateDocumentFieldType, roleId: string, placeholder: string) {
    this.name = name;
    this.type = type;
    this.roleId = roleId;
    this.placeholder = placeholder;
  }
}

export class TemplateDocumentTableField extends TemplateDocumentDataField {
  fields: Map<string, TemplateDocumentDataField> = new Map<string, TemplateDocumentDataField>();
  tableNameLink: string;
  constructor(name: string, type: TemplateDocumentFieldType, roleId: string, placeholder: string, tableNameLink: string) {
    super(name, type, roleId, placeholder);
    this.tableNameLink = tableNameLink;
  }
}
export class TemplateDoc {
  id: string = null;
  title: string = null;
  description: string = null;
  body: string = null;
  _fields: Map<string, TemplateDocumentDataField | TemplateDocumentTableField> = null;
  _preparedHtml: string = null;

  public get fields(): Map<string, (TemplateDocumentDataField | TemplateDocumentTableField)> {
   return this._fields;
  }

  public get view(): string {
    return this._preparedHtml;
  }
}
