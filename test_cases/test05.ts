declare var Component: any;

@Component({
    selector: 'test',
    template: `
        div+p+bq
    `
})
class SiblingTest {
    constructor() {         
    }
}