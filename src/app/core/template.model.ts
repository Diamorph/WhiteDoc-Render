import {TemplateDocumentFieldType, templateDocumentFieldTypeKeys, TemplateDocumentFieldTypeToSelector} from './template-document-field';
import {XmlHelper} from './xml-helper';
import {
  TemplateDocumentDataField,
  TemplateDocumentTableField
} from '../template/template-document/models/template-document-data-field.model';

export interface TemplateModel {
  uuid: string;
  name: string;
  subject: string;
  message: string;
  description: string;
  data: string;
  active: boolean;
  parentTemplateUuid: any;
  createdAt: string;
  modifiedAt: string;
  expireAfter: number;
  notifyBefore: number;
  access: string;
  categoryIds: any[];
}

export const template: TemplateModel = {
  uuid: 'b21756c8-3f83-47d1-bd03-e05b4278f1cf',
  name: 'Text Fields',
  subject: 'Test',
  message: 'Test',
  description: 'Text Fields',
  data: `
<template>
  <info>
    <name>Text Fields</name>
    <description>Text Fields</description>
    <subject>Test</subject>
    <message>Test</message>
    <expire/>
  </info>
  <documents>
    <document id="273a05dc-6294-4610-949c-503a73dc2714">
    <info>
        <title>Test</title>
        <description>Test</description>
    </info>
    <body>
        <div>Test</div>
        <field type="text" name="name" placeholder="Placeholder text" roleId="c60f17e9-e17a-4944-9d3a-f2cbd77b86b7"/>
        <div>Test 2</div>
        <field type="text" name="name1" placeholder="Placeholder text" roleId="c60f17e9-e17a-4944-9d3a-f2cbd77b86b7"/>
    </body>
    </document>
  </documents>
  <flow>
    <roles>
        <role id="62755619-e4ce-4f13-8add-dd9a84776fdb" title="Envelope Sender" type="sender" order="0"/>
        <role id="c60f17e9-e17a-4944-9d3a-f2cbd77b86b7" title="diamorph" type="assignee" order="1"
        mailboxUuid="b80aead5-003c-4172-8613-f8d0bd16cca5"/>
    </roles>
  </flow>
</template>`,
  active: false,
  parentTemplateUuid: null,
  createdAt: '2020-01-21T08:47:41.000+0000',
  modifiedAt: '2020-02-03T15:34:27.000+0000',
  expireAfter: 0,
  notifyBefore: 0,
  access: 'mailbox',
  categoryIds: []
};
export enum TemplateRoleType {
  SENDER = 'sender',
  ASSIGNEE = 'assignee',
  COPY = 'copy'
}

export class TemplateInfo {
  name: string = null;
  description: string = null;
  subject: string = null;
  message: string = null;
  expireAfter: number = null; // days
  notifyIn: number = null; // days
}

export class TemplateRole {
  id: string = null;
  mailbox: string = null;
  title: string = null;
  order = 0;
  type: TemplateRoleType = null;

  public isSender(): boolean {
    return this.type === TemplateRoleType.SENDER;
  }
}

export class TemplateFlow {
  roles: Map<string, TemplateRole> = new Map<string, TemplateRole>();
}
export const commonFieldAttributes: string[] = ['name', 'type', 'placeholder', 'roleId', 'tableNameLink'];



export class TemplateDocument {
  id: string = null;
  title: string = null;
  description: string = null;
  body: string = null;
  private _fields: Map<string, TemplateDocumentDataField | TemplateDocumentTableField> = null;
  private _preparedHtml: string = null;

  public get fields(): Map<string, (TemplateDocumentDataField | TemplateDocumentTableField)> {
    if (this._fields === null) {
      this._fields = new Map<string, (TemplateDocumentDataField | TemplateDocumentTableField)>();
      this.parseBody();
    }
    return this._fields;
  }

  public get view(): string {
    this.fields.has('1');
    return this._preparedHtml;
  }

  private parseBody() {
    const body = XmlHelper.parseXml('<body>' + this.body + '</body>');
    if (!body.hasChildNodes()) {
      return;
    }

    const bodyElement = body.childNodes[0] as Element;
    this.prepareDocumentBodyHtml(bodyElement);
    this._preparedHtml = XmlHelper.elementToString(bodyElement);
  }

  private prepareDocumentBodyHtml(node: Element) {
    if (!node.hasChildNodes()) {
      return;
    }
    const tableCollection: TemplateDocumentTableField[] = Array.from(node.getElementsByTagName('table'))
      .map(tableNode => {
        const tableFiledsCollection: Element[] = Array.from(tableNode.getElementsByTagName('field'));
        const tableField: TemplateDocumentTableField = this.createFieldTable(tableNode, TemplateDocumentFieldType.TABLE);
        tableFiledsCollection.forEach(fieldNode => {
          this.createFieldByType(fieldNode, tableField.fields, true);
        });
        return tableField;
      });
    const fieldCollection: Element[] = Array.from(node.getElementsByTagName('field'));
    fieldCollection.forEach(fieldNode => this.createFieldByType(fieldNode, this._fields, false));
    console.log(this._fields);
  }
  private createFieldByType(
    node: Element,
    fieldMap: Map<string, TemplateDocumentDataField | TemplateDocumentTableField> | Map<string, TemplateDocumentDataField>,
    insertIntoTable: boolean
  ): void {
    const type: string = node.getAttribute('type');
    const matchEnumKey = templateDocumentFieldTypeKeys.find(key => TemplateDocumentFieldType[key] === type);
    const field: TemplateDocumentDataField = this.createField(node, matchEnumKey);
    fieldMap.set(field.name, field);
    (insertIntoTable) ? node.parentNode.removeChild(node) :
      this.replaceFieldNode(TemplateDocumentFieldTypeToSelector[matchEnumKey], field, node);
  }

  private createFieldTable(node: Element, type: TemplateDocumentFieldType): TemplateDocumentTableField {
    const table: TemplateDocumentTableField = new TemplateDocumentTableField(
      node.getAttribute('name'),
      type,
      node.getAttribute('roleId'),
      node.getAttribute('placeholder'),
      node.getAttribute('name')
    );
    this._fields.set(table.name, table);
    return table;
  }
  private createField(node: Element, enumKey: string): TemplateDocumentDataField {
    const field: TemplateDocumentDataField = new TemplateDocumentDataField(
      node.getAttribute('name'),
      TemplateDocumentFieldType[enumKey],
      node.getAttribute('roleId'),
      node.getAttribute('placeholder')
    );
    const attributes: string[] = node.getAttributeNames().filter(attr => !commonFieldAttributes.find(uAttr => attr === uAttr));
    this.setAttributesToField(field, node, attributes);
    return field;
  }
  private setAttributesToField(field: TemplateDocumentDataField, node: Element, attributes: string[]): void {
    attributes.forEach(attr => {
      let nodeAttr: any = node.getAttribute(attr);
      if (nodeAttr === 'true' || nodeAttr === 'false') {
        nodeAttr = XmlHelper.getAttributeBooleanValue(nodeAttr);
      }
      field.attributes.set(attr, nodeAttr);
    });
  }
  private replaceFieldNode(componentSelector: string, field: TemplateDocumentDataField, node: Element) {
    const element = document.createElement(componentSelector);
    element.setAttributeNS(null, 'documentId', this.id);
    element.setAttributeNS(null, 'name', field.name);
    node.parentNode.insertBefore(element, node);
    node.parentNode.removeChild(node);
  }
}


