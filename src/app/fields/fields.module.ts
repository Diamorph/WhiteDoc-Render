import { NgModule } from '@angular/core';
import {TextFieldComponent} from './text-field/text-field.component';

@NgModule({
  declarations: [TextFieldComponent],
  exports: [TextFieldComponent]
})
export class FieldsModule {}
