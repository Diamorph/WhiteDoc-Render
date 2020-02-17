// import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
// import { Template, TemplateRole, TemplateRoleType } from '@core/models/template.model';
// import { Subject } from 'rxjs';
// import { uuid } from 'uuidv4';
// import {AccessLevel} from '@core/models/access-level.model';
// import { TemplateDocument } from '@core/models/template-document.model';
//
// export class TemplateForm {
//   public form: FormGroup;
//   private _accessLevelChanged = new Subject();
//   public accessLevelChanged = this._accessLevelChanged.asObservable();
//   private uuidPool: string[] = [];
//   private defaultRoleName = 'Envelope Sender';
//   private template: any;
//
//   public constructor() {
//     this.template = new Template();
//     this.form = new FormGroup({}, { validators: [this.expirationValid], updateOn: 'blur' });
//
//     this.form.addControl('TemplateName', new FormControl('', { validators: [Validators.required] }));
//     this.form.addControl('TemplateDescription', new FormControl(''));
//     this.form.addControl('EnvelopeSubject', new FormControl(''));
//     this.form.addControl('EnvelopeMessage', new FormControl(''));
//     this.form.addControl('ExpireAfter', new FormControl('', [this.isOptionalNumeric]));
//     this.form.addControl('NotifyBefore', new FormControl('', [this.isOptionalNumeric]));
//
//     this.form.addControl('Documents', new FormArray([], [this.nestedExists]));
//     this.form.addControl('Roles', new FormArray([], [this.validateRoles]));
//     this.addDefaultRole();
//     this.addRole();
//
//     this.form.addControl(
//       'TemplateAccessLevel',
//       new FormControl(AccessLevel.Mailbox, { validators: [Validators.required], updateOn: 'change' })
//     );
//     this.form.get('TemplateAccessLevel').valueChanges.subscribe(() => {
//       this.accessLevelChanged.next();
//     });
//
//     this.form.addControl(
//       'TemplateAccessCategory',
//       new FormControl([])
//     );
//   }
//
//   public applyTemplate(template: Template) {
//     this.uuidPool = [];
//     this._template = template;
//     this.form.get('TemplateName').patchValue(this._template.info.name);
//     this.form.get('TemplateDescription').patchValue(this._template.info.description);
//     this.form.get('EnvelopeSubject').patchValue(this._template.info.subject);
//     this.form.get('EnvelopeMessage').patchValue(this._template.info.message);
//     this.form.get('ExpireAfter').patchValue(this._template.info.expireAfter || '');
//     this.form.get('NotifyBefore').patchValue(this._template.info.notifyIn || '');
//     (this.form.get('Roles') as FormArray).clear();
//     this._template.flow.roles.forEach((role) => {
//       const roleGroup = this.addRole();
//       this.uuidPool.push(role.id);
//       roleGroup.get('RoleId').patchValue(role.id);
//       roleGroup.get('RoleName').patchValue(role.title);
//       roleGroup.get('RoleMailbox').patchValue(role.mailbox);
//       roleGroup.get('RoleOrder').patchValue(role.order);
//       roleGroup.get('RoleType').patchValue(role.type);
//       if (role.type === TemplateRoleType.SENDER) {
//         roleGroup.get('RoleOrder').setValidators(this.getRoleOrderValidators(0));
//         roleGroup.get('RoleOrder').updateValueAndValidity({onlySelf: true});
//         roleGroup.get('RoleType').disable();
//       }
//     });
//
//     (this.form.get('Documents') as FormArray).clear();
//     this._template.documents.forEach((document) => {
//       const documentGroup = this.addDocument();
//       this.uuidPool.push(document.id);
//       documentGroup.get('DocumentId').patchValue(document.id);
//       documentGroup.get('DocumentTitle').patchValue(document.title);
//       documentGroup.get('DocumentDescription').patchValue(document.description);
//       documentGroup.get('DocumentBody').patchValue(document.body);
//     });
//   }
//
//   public get template(): Template {
//     const template = new Template(this._template.id);
//     template.info.name = this.form.get('TemplateName').value;
//     template.info.description = this.form.get('TemplateDescription').value;
//     template.info.subject = this.form.get('EnvelopeSubject').value;
//     template.info.message = this.form.get('EnvelopeMessage').value;
//     template.info.expireAfter = this.form.get('ExpireAfter').value || null;
//     template.info.notifyIn = this.form.get('NotifyBefore').value || null;
//
//     (this.form.get('Documents') as FormArray).controls.forEach((document: FormGroup) => {
//       const tdoc = new TemplateDocument();
//       tdoc.id = document.get('DocumentId').value;
//       tdoc.title = document.get('DocumentTitle').value;
//       tdoc.description = document.get('DocumentDescription').value;
//       tdoc.body = document.get('DocumentBody').value;
//       template.documents.set(tdoc.id, tdoc);
//     });
//
//     (this.form.get('Roles') as FormArray).controls.forEach((role: FormGroup) => {
//       const trole = new TemplateRole();
//       trole.id = role.get('RoleId').value;
//       trole.type = role.get('RoleType').value;
//       trole.order = parseInt(role.get('RoleOrder').value, 10);
//       trole.title = role.get('RoleName').value;
//       trole.mailbox = role.get('RoleMailbox').value || null;
//       template.flow.roles.set(trole.id, trole);
//     });
//
//     return template;
//   }
//
//   public setAccessLevel(level: AccessLevel) {
//     this.form.get('TemplateAccessLevel').patchValue(level);
//   }
//
//   public setAccessCategories(categories: number[]) {
//     this.form.get('TemplateAccessCategory').patchValue(categories);
//   }
//
//   public clickCategory(category: number) {
//     const categories = this.form.get('TemplateAccessCategory').value as Array<number>;
//     if (categories.indexOf(category) > -1) {
//       categories.splice(categories.indexOf(category), 1);
//     } else {
//       categories.push(category);
//     }
//
//     this.setAccessCategories(categories);
//   }
//
//   public getAccessCategories(): number[] {
//     return this.form.get('TemplateAccessCategory').value as Array<number>;
//   }
//
//
//   public getAccessLevel() {
//     return this.form.get('TemplateAccessLevel').value;
//   }
//
//   private expirationValid(c: AbstractControl): ValidationErrors | null {
//     if (c.get('ExpireAfter') === null || c.get('NotifyBefore') === null) {
//       return null;
//     }
//     const expireAfter = c.get('ExpireAfter').value === '' ? null : parseInt(c.get('ExpireAfter').value, 10);
//     const notifyIn = c.get('NotifyBefore').value === '' ? null : parseInt(c.get('NotifyBefore').value, 10);
//     if ((expireAfter === null && notifyIn === null) || (expireAfter !== null && notifyIn === null)) {
//       return null;
//     }
//
//     if (isNaN(expireAfter) || isNaN(notifyIn)) {
//       return {wrongNumbers: true};
//     }
//
//     if (expireAfter === null && notifyIn !== null) {
//       return {wrongNotify: true};
//     }
//
//     if (expireAfter < 1 || notifyIn < 1) {
//       return {zeroValue: true};
//     }
//
//     if (notifyIn >= expireAfter) {
//       return {wrongNotify: true};
//     }
//
//     return null;
//   }
//
//   private isOptionalNumeric(control: AbstractControl) {
//     if (!!control.value && isNaN(parseInt(control.value, 10))) {
//       return {isNaN: true};
//     }
//   }
//
//   private nestedExists(c: AbstractControl): ValidationErrors | null {
//     if ((c as FormArray).controls.length < 1) {
//       return {nestedEmpty: true};
//     }
//     return null;
//   }
//
//   private validateRoles(c: AbstractControl): ValidationErrors | null {
//     if ((c as FormArray).controls.length < 2) {
//       return {nestedEmpty: true};
//     }
//
//     return null;
//   }
//
//   private getRoleOrderValidators(minValue: number) {
//     return [
//       Validators.required,
//       Validators.pattern(/\d+/),
//       Validators.min(minValue)
//     ];
//   }
//
//   private addDefaultRole() {
//     const defaultRole = this.addRole();
//     defaultRole.get('RoleName').patchValue(this.defaultRoleName);
//     defaultRole.get('RoleOrder').setValidators(this.getRoleOrderValidators(0));
//     defaultRole.get('RoleOrder').patchValue(0);
//     defaultRole.get('RoleType').patchValue(TemplateRoleType.SENDER);
//     defaultRole.get('RoleType').disable();
//   }
//
//   public addRole() {
//     const formRole = this.initRoleControls();
//     (this.form.controls.Roles as FormArray).push(formRole);
//     const maxOrder = Math.max.apply(Math, (this.form.controls.Roles as FormArray).controls
//       .map((role: FormGroup) => parseInt(role.get('RoleOrder').value, 10) || 0));
//     formRole.get('RoleOrder').patchValue(maxOrder + 1);
//     return formRole;
//   }
//
//   public removeRole(i: number) {
//     if (i > 1) {
//       (this.form.controls.Roles as FormArray).removeAt(i);
//     }
//   }
//
//   private initRoleControls(): FormGroup {
//     return new FormGroup({
//       RoleId: new FormControl(this.vacantUuid(), {validators: [Validators.required]}),
//       RoleName: new FormControl('', {validators: [Validators.required]}),
//       RoleMailbox: new FormControl(''),
//       RoleOrder: new FormControl('', {validators: this.getRoleOrderValidators(1)}),
//       RoleType: new FormControl(TemplateRoleType.ASSIGNEE, {validators: [Validators.required]})
//     });
//   }
//
//   public addDocument() {
//     const formDocument = this.initDocumentControls();
//     (this.form.controls.Documents as FormArray).push(formDocument);
//     return formDocument;
//   }
//
//   public removeDocument(i: number) {
//     (this.form.controls.Documents as FormArray).removeAt(i);
//   }
//
//   public fieldError(name: string, formGroup?: FormGroup): boolean {
//     const c = formGroup instanceof FormGroup ? formGroup.get(name) : this.form.get(name);
//     return c.invalid && c.touched;
//   }
//
//   public makeErrorFormControlsTouched(fg?: FormGroup|FormArray) {
//     if (fg === undefined) {
//       this.makeErrorFormControlsTouched(this.form);
//       return;
//     }
//     fg.markAsTouched();
//     Object.keys(fg.controls).forEach(key => {
//       if (fg.controls[key] instanceof FormControl) {
//         fg.controls[key].markAsTouched();
//       } else {
//         this.makeErrorFormControlsTouched(fg.controls[key]);
//       }
//     });
//   }
//
//   private initDocumentControls(): FormGroup {
//     return new FormGroup({
//       DocumentId: new FormControl(this.vacantUuid(), {validators: [Validators.required]}),
//       DocumentTitle: new FormControl('', {validators: [Validators.required]}),
//       DocumentDescription: new FormControl('', {validators: [Validators.required]}),
//       DocumentBody: new FormControl('', {validators: [Validators.required]})
//     });
//   }
//
//
//   private vacantUuid(): string {
//     let uuidValue = uuid();
//     while (this.uuidPool.indexOf(uuidValue) > -1) {
//       uuidValue = uuid();
//     }
//     this.uuidPool.push(uuidValue);
//     return uuidValue;
//   }
//
// }
