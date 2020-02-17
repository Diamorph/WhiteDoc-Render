import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {
  TemplateDocumentDataField,
  TemplateDocumentTableField
} from '../../template/template-document/models/template-document-data-field.model';

@Component({
  selector: 'app-document-field-text',
  templateUrl: './text-field.component.html',
  styleUrls: ['./text-field.component.scss']
})
export class TextFieldComponent implements OnInit, OnChanges {
  @Input() field: TemplateDocumentDataField | TemplateDocumentTableField;
  ngOnInit(): void {
    console.log(this.field);
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.field);
  }
}
