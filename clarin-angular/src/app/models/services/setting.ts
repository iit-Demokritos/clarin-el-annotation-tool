import { ThemePalette } from '@angular/material/core';

export interface Setting {
  name: string;
  value: string;
  type: string;
  checked: boolean;
  allChecked: boolean;
  color: ThemePalette;
  subsettings?: Setting[];
}
