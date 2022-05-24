import { Attribute } from '../models/attribute'

export function compareAttributes(attr1: Attribute, attr2: Attribute): number {
  if (attr1 == null) {
    if (attr2 == null) {
      return 0;
    }
    return -1; // Set ann2 as "greater", at the end
  }
  if (attr2 == null) {
    return 1; // Set ann1 as "greater", at the end
  }
  // Both attributes are not null/undefined...
  if (attr1.name == attr2.name) {
    if (attr1.value < attr2.value) {
      return -1;
    }
    if (attr1.value > attr2.value) {
      return 1;
    }
    return 0;
  }
  if (attr1.name < attr2.name) {
    return -1;
  }
  return 1;
}; /* compareAttributes */

export function compareAttributeSets(set1: Attribute[], set2: Attribute[]): number {
  if (set1 == null) {
    if (set2 == null) {
      return 0;
    }
    return -1; // Set ann2 as "greater", at the end
  }
  if (set2 == null) {
    return 1; // Set ann1 as "greater", at the end
  }
  // Both attribute sets are not null/undefined...

  var items1 = set1.length;
  var items2 = set2.length;
  // Check existence of attributes...
  if (items1 == 0) {
    if (items2 == 0) return 0; // They are equal
    return 1; // Set ann1 as "greater", at the end
  } else if (items2 == 0) {
    return -1; // Set ann2 as "greater", at the end
  }

  // Sort both sets...
  set1.sort(compareAttributes);
  set2.sort(compareAttributes);
  // Iterate over items, and check if they are equal...
  var len = Math.min(items1, items2);
  var cmp;
  for (let i = 0; i < len; i++) {
    cmp = compareAttributes(set1[i], set2[i]);
    if (cmp != 0) {return cmp;}
  }
  // If we reached here, the items are equal. Sort based on length...
  if (items1 == items2) {
    return 0;
  }
  return items1 < items2 ? -1 : 1;
}; /* compareAttributeSets */

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
