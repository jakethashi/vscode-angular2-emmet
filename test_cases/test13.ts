declare var Component: any;

@Component({
    selector: 'test',
    template: `
        td[title="Hello world!" colspan=3]
    `
})
class CustomAttributesTest {
    constructor() {         
    }
}