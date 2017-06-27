declare var Component: any;

@Component({
    selector: 'test',
    template: `
        ul>li.item$@-*5
    `
})
class NumberingDirectionChangeTest {
    constructor() {         
    }
}