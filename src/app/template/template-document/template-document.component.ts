import {
  AfterContentInit, AfterViewInit,
  Compiler,
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef, Directive, ElementRef,
  Input, NgModule,
  OnInit, QueryList, TemplateRef,
  ViewChild, ViewChildren,
  ViewContainerRef
} from '@angular/core';
import {TemplateDocumentDataField, TemplateDocumentTableField} from './models/template-document-data-field.model';
import {XmlHelper} from '../../core/xml-helper';
import {
  TemplateDocumentFieldType,
  templateDocumentFieldTypeKeys,
  TemplateDocumentFieldTypeToSelector
} from '../../core/template-document-field';
import {commonFieldAttributes} from '../../core/template.model';
import {BrowserModule} from '@angular/platform-browser';
import {FieldsModule} from '../../fields/fields.module';
import {TextFieldComponent} from '../../fields/text-field/text-field.component';
@Component({
  selector: 'app-template-document',
  template: `
    <ng-template #templateDoc></ng-template>
<!--    <ng-template #dynamicInsert></ng-template>-->
  `,
  styleUrls: ['./template-document.component.scss']
})
export class TemplateDocumentComponent implements OnInit,  AfterContentInit, AfterViewInit {
  @Input() document: any;
  @ViewChild('templateDoc', {read: ViewContainerRef, static: true}) templateDoc: ViewContainerRef;
  // @ViewChild('dynamicInsert', {read: ViewContainerRef, static: true}) dynamicInsert: ViewContainerRef;
  // @ViewChildren('dynamicInsert', {read: ViewContainerRef}) dynamicInsert: QueryList<ViewContainerRef>;
  // @ViewChild('fieldsContainer', { read: ViewContainerRef }) container;
  constructor(
    private resolver: ComponentFactoryResolver,
    private compiler: Compiler,
    private elRef: ElementRef
  ) {}
  private parseBody() {
    const body = XmlHelper.parseXml('<body>' + this.document.body + '</body>');
    if (!body.hasChildNodes()) {
      return;
    }
    const bodyElement = body.childNodes[0] as Element;
    this.prepareDocumentBodyHtml(bodyElement);
    this.document._preparedHtml = XmlHelper.elementToString(bodyElement);
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
    fieldCollection.forEach(fieldNode => this.createFieldByType(fieldNode, this.document.fields, false));
    console.log(this.document._fields);
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
    this.document.fields.set(table.name, table);
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
    // this.createComponent();
    const element = document.createElement(componentSelector);
    element.setAttributeNS(null, 'type', field.type);
    element.setAttributeNS(null, 'name', field.name);
    node.parentNode.insertBefore(element, node);
    node.parentNode.removeChild(node);
  }
  ngOnInit(): void {
    console.log('Template Document');
    console.log(this.document);
    this.parseBody();
    console.log(this.document);
  }
  ngAfterContentInit(): void {
    this.generateComponent(this.document.view);
    this.createComponent();
  }
  ngAfterViewInit(): void {
  }

  private createComponent() {
    console.log(this.document.fields.get('name'));
    // this.dynamicInsert.forEach(res => console.log(res));
    // const factory = this.resolver.resolveComponentFactory(TextFieldComponent);
    // const componentRef = this.dynamicInsert.createComponent(factory);
    // (componentRef.instance as TextFieldComponent).field = this.document.fields.get('name');
    // containerRef.createComponent(factory);
    // const dynamicComponent = <TextFieldComponent>
    // const viewContainerRef = this.container.viewContainerRef;
    // console.log(factory);
    // console.log(viewContainerRef);
    // this.componentRef = this.container.createComponent(factory);
    // this.componentRef.instance.field = this.document.fields[0];
  }
  private generateComponent(template: string): void {
    @Component({template})
    class RenderComponent {
      // @ViewChildren('app-document-field-text') textFields: QueryList<any>;
      constructor(public parent: TemplateDocumentComponent) { }
      // ngAfterViewInit(): void {
      //   console.log('after');
      //   console.log(this.textFields);
      // }
    }
    @NgModule({
      imports: [BrowserModule, FieldsModule],
      declarations: [RenderComponent],
    }) class RenderModule { }
    const mod = this.compiler.compileModuleAndAllComponentsSync(RenderModule);
    const factory = mod.componentFactories.find((comp) =>
      comp.componentType ===  RenderComponent
    );
    const componentRef = this.templateDoc.createComponent(factory);
    const childNodes: Element[] = Array.from(componentRef.location.nativeElement.childNodes);
    console.log(childNodes);
    childNodes.forEach((n: Element) => {
      console.log(n.nodeName);
      // console.log(this.textFields);
      // this.createComponent(this.document.fields.get('name'));
      // if (n.nodeName === 'document') {
      //   this.parseTemplateDocumentNode(n);
      // }
    });
    // const test = childNodes.find(node => node. === 'app-document-field-text');
    console.log(childNodes);
  }
}
