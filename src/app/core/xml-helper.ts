export class XmlHelper {
  private static oSerializer = new XMLSerializer();
  private static parser = new DOMParser();


  public static elementToString(node: Element) {

    let content = '';
    node.childNodes.forEach((ch: Element) => {
      content += this.oSerializer.serializeToString(ch);
    });

    return content;
  }

  public static documentToString(node: Element) {
    return this.oSerializer.serializeToString(node);
  }

  public static parseXml(xml: string): Document {
    const result = this.parser.parseFromString(xml, 'text/xml');
    if (
      result.hasChildNodes() && result.childNodes[0].nodeName === 'html' &&
      result.childNodes[0].hasChildNodes() && result.childNodes[0].childNodes[0].nodeName === 'body' &&
      result.childNodes[0].childNodes[0].hasChildNodes() && result.childNodes[0].childNodes[0].childNodes[0].nodeName === 'parsererror'
    ) {
      throw new Error('Parse XML error');
    }
    return result;
  }

  public static getAttributeBooleanValue(value): boolean {
    if (!!value && value.toLowerCase() === 'true') {
      return true;
    }
    return false;
  }

}


export class ObjectXmlSerializer {
  private _doc: Document;

  public constructor() {
    this._doc = document.implementation.createDocument('', '', null);
  }

  public createElement(name): Element {
    return this._doc.createElement(name);
  }

  public createXmlNodeWithValue(name: string, value: string): Element {
    const el = this._doc.createElement(name);
    try {
      el.innerHTML = value;
    } catch (e) {
      el.appendChild(this._doc.createCDATASection(value));
    }
    return el;
  }

  public createXmlNodeWithTextValue(name: string, value: string) {
    const el = this._doc.createElement(name);
    el.innerHTML = value;
    return el;
  }

}
