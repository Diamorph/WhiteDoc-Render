import {Component, OnInit} from '@angular/core';
import {
  template,
  TemplateDocument,
  TemplateFlow,
  TemplateInfo,
  TemplateModel,
  TemplateRole,
  TemplateRoleType
} from '../core/template.model';
import {ObjectXmlSerializer, XmlHelper} from '../core/xml-helper';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss']
})
export class TemplateComponent implements OnInit {
  public renderTemplate: TemplateModel = template;
  private templateUuid: string = null;
  private templateInfo: TemplateInfo = new TemplateInfo();
  private templateFlow: TemplateFlow = new TemplateFlow();
  private templateDocuments: Map<string, TemplateDocument> = new Map<string, TemplateDocument>();

  // constructor(uuid?: string, xml?: string) {
  //   if (!!uuid) {
  //     this.templateUuid = !!uuid ? uuid : null;
  //   }
  //   if (!!xml) {
  //     this.initFromXml(xml);
  //   }
  // }

  public get info(): TemplateInfo {
    return this.templateInfo;
  }

  public get flow(): TemplateFlow {
    return this.templateFlow;
  }

  public get documents(): Map<string, TemplateDocument> {
    return this.templateDocuments;
  }

  public get id(): string {
    return this.templateUuid;
  }

  public toXmlString(): string {
    this.normalizeData();
    const xml = new ObjectXmlSerializer();
    const template = xml.createElement('template');
    template.appendChild(this.createInfoSectionXML(xml));
    template.appendChild(this.createDocumentsSectionXML(xml));
    template.appendChild(this.createFlowSectionXML(xml));
    return XmlHelper.documentToString(template);
  }

  private createInfoSectionXML(xml: ObjectXmlSerializer) {
    const templateInfo = xml.createElement('info');
    templateInfo.appendChild(xml.createXmlNodeWithValue('name', this.templateInfo.name));
    templateInfo.appendChild(xml.createXmlNodeWithValue('description', this.templateInfo.description));
    templateInfo.appendChild(xml.createXmlNodeWithValue('subject', this.templateInfo.subject));
    templateInfo.appendChild(xml.createXmlNodeWithValue('message', this.templateInfo.message));
    const expire = xml.createElement('expire');
    if (this.templateInfo.expireAfter) {
      expire.setAttribute('after', this.templateInfo.expireAfter.toString());
    }
    if (this.templateInfo.notifyIn) {
      expire.setAttribute('notifyIn', this.templateInfo.notifyIn.toString());
    }
    templateInfo.appendChild(expire);
    return templateInfo;
  }

  private createDocumentsSectionXML(xml: ObjectXmlSerializer) {
    console.log(xml);
    const documents = xml.createElement('documents');
    this.templateDocuments.forEach((document: TemplateDocument) => {
      documents.appendChild(this.createDocumentNode(xml, document));
    });
    return documents;
  }

  private createDocumentNode(xml: ObjectXmlSerializer, templateDocument: TemplateDocument) {
    const document = xml.createElement('document');
    document.setAttribute('id', templateDocument.id);
    const info = xml.createElement('info');
    info.appendChild(xml.createXmlNodeWithValue('title', templateDocument.title));
    info.appendChild(xml.createXmlNodeWithValue('description', templateDocument.description));
    document.appendChild(info);
    document.appendChild(xml.createXmlNodeWithTextValue('body', templateDocument.body));
    return document;
  }

  private createFlowSectionXML(xml: ObjectXmlSerializer) {
    const flow = xml.createElement('flow');
    const roles = xml.createElement('roles');
    this.templateFlow.roles.forEach((role: TemplateRole) => {
      roles.appendChild(this.createRoleNode(xml, role));
    });
    flow.appendChild(roles);
    return flow;
  }

  private createRoleNode(doc: ObjectXmlSerializer, role: TemplateRole) {
    const roleNode = doc.createElement('role');
    roleNode.setAttribute('id', role.id);
    roleNode.setAttribute('title', role.title);
    roleNode.setAttribute('type', role.type);
    roleNode.setAttribute('order', role.order.toString());
    if (!!role.mailbox) {
      roleNode.setAttribute('mailboxUuid', role.mailbox);
    }
    return roleNode;
  }


  private normalizeData() {
    this.normalizeRoles();
  }

  private normalizeRoles() {
    const roleOrders = Array.from(this.templateFlow.roles).map(arr => arr[1].order)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .sort(((a, b) => a > b ? 1 : (a < b ? -1 : 0)));
    const roles = Array.from(this.templateFlow.roles).map(arr => {
      arr[1].order = roleOrders.indexOf(arr[1].order);
      return arr[1];
    }).sort((a: TemplateRole, b: TemplateRole) => {
      return a.order > b.order ? 1 : (a.order < b.order ? -1 : 0);
    });

    this.templateFlow.roles.clear();
    roles.forEach(role => {
      this.templateFlow.roles.set(role.id, role);
    });
  }

  private initFromXml(xml: string) {
    const template = XmlHelper.parseXml(xml);
    if (!template.hasChildNodes() || template.childNodes[0].nodeName !== 'template') {
      throw new Error('Invalid envelope xml structure');
    }
    this.parseTemplate(template.childNodes[0] as Element);
  }

  private parseTemplate(template: Element) {
    template.childNodes.forEach((node: Element) => {
      if (node.nodeName === 'info') {
        this.parseTemplateInfoNode(node);
      }

      if (node.nodeName === 'flow') {
        this.parseTemplateFlowNode(node);
      }

      if (node.nodeName === 'documents') {
        this.parseTemplateDocumentsNode(node);
      }

    });
    console.log(this.templateDocuments);
  }

  private parseTemplateInfoNode(node: Element) {
    node.childNodes.forEach((n: Element) => {
      switch (n.nodeName) {
        case 'name':
          this.templateInfo.name = n.hasChildNodes() ? n.childNodes[0].nodeValue : '';
          break;
        case 'description':
          this.templateInfo.description = n.hasChildNodes() ? n.childNodes[0].nodeValue : '';
          break;
        case 'subject':
          this.templateInfo.subject = n.hasChildNodes() ? n.childNodes[0].nodeValue : '';
          break;
        case 'message':
          this.templateInfo.message = n.hasChildNodes() ? n.childNodes[0].nodeValue : '';
          break;
        case 'expire':
          let parsed;
          if (!isNaN(parsed = parseInt(n.getAttribute('after'), 10))) {
            this.templateInfo.expireAfter = parsed;
          }
          if (!isNaN(parsed = parseInt(n.getAttribute('notifyIn'), 10))) {
            this.templateInfo.notifyIn = parsed;
          }
          break;
      }
    });
  }

  private parseTemplateFlowNode(node: Element) {
    node.childNodes.forEach((n: Element) => {
      if (n.nodeName === 'roles') {
        this.parseTemplateFlowRolesNode(n);
      }
    });
  }

  private parseTemplateFlowRolesNode(node: Element) {
    node.childNodes.forEach((n: Element) => {
      if (n.nodeName === 'role') {
        this.parseTemplateFlowRoleNode(n);
      }
    });
  }

  private parseTemplateFlowRoleNode(node: Element) {
    const role = new TemplateRole();
    role.id = node.getAttribute('id');
    role.title = node.getAttribute('title');
    role.order = parseInt(node.getAttribute('order'), 10);
    // role.type = (node.getAttribute('type') as keyof typeof TemplateRoleType) as TemplateRoleType;
    role.type = node.getAttribute('type') as TemplateRoleType;
    role.mailbox = node.getAttribute('mailboxUuid');
    this.templateFlow.roles.set(role.id, role);
  }

  private parseTemplateDocumentsNode(node: Element) {
    node.childNodes.forEach((n: Element) => {
      if (n.nodeName === 'document') {
        this.parseTemplateDocumentNode(n);
      }
    });
  }

  private parseTemplateDocumentNode(node: Element) {
    const doc = new TemplateDocument();
    doc.id = node.getAttribute('id');
    node.childNodes.forEach((n: Element) => {
      switch (n.nodeName) {
        case 'info':
          n.childNodes.forEach((e: Element) => {
            switch (e.nodeName) {
              case 'title':
                doc.title = e.hasChildNodes() ? e.childNodes[0].nodeValue : '';
                break;
              case 'description':
                doc.description = e.hasChildNodes() ? e.childNodes[0].nodeValue : '';
                break;
            }
          });
          break;
        case 'body':
          doc.body = XmlHelper.elementToString(n);
          break;
      }
    });

    this.templateDocuments.set(doc.id, doc);
  }
  ngOnInit(): void {
    console.log(this.renderTemplate);
    this.initFromXml(this.renderTemplate.data);
  }
}
