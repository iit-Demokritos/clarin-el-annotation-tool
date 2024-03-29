import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { SessionsRoutingModule } from './sessions-routing.module';

import { Error403Component } from './403.component';
import { Error404Component } from './404.component';
import { Error500Component } from './500.component';

const COMPONENTS: any[] = [Error404Component, Error403Component, Error500Component];
const COMPONENTS_DYNAMIC: any[] = [];

@NgModule({
    imports: [SharedModule, SessionsRoutingModule],
    declarations: [...COMPONENTS, ...COMPONENTS_DYNAMIC]
})
export class SessionsModule {}
