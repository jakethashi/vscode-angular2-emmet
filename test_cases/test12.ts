declare var Component: any;

@Component({
    selector: 'test',
    template: `
        div#header+div.page+div#footer.class1.class2.class3
    `
})
class IdAndClassTest {
    constructor() {         
    }
}