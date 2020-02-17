import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {TemplateComponent} from './template/template.component';
import {EnvelopeComponent} from './envelope/envelope.component';
import {TextFieldComponent} from './fields/text-field/text-field.component';
import {TemplateDocumentComponent} from './template/template-document/template-document.component';
import {FieldsModule} from './fields/fields.module';

@NgModule({
  declarations: [
    AppComponent,
    TemplateComponent,
    EnvelopeComponent,
    TemplateDocumentComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FieldsModule
  ],
  providers: [],
  entryComponents: [TextFieldComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
