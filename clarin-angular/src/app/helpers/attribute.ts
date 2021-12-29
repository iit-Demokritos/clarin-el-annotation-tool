import { Attribute } from '../models/attribute'

export function attributeEqual(attr1: Attribute, attr2: Attribute): boolean {
  if (attr1.name == attr2.name && attr1.value === attr2.value) {
    return true;
  }
  //value?
  return false;
}; /* attributeEqual */

export function attributesetEqual(attributeset1: Attribute[], attributeset2: Attribute[]): boolean {
  if (attributeset1.length == attributeset2.length) {
    for (let i = 0; i < attributeset1.length; i++) {
      if (attributeEqual(attributeset1[i], attributeset2[i]) == false) {
        return false;
      }
    }
    return true;
  }
  return false;
}; /* attributesetEqual */
