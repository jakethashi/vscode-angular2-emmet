declare var Component: any;

@Component({
    selector: 'test',
    template: `
        ul.list>li[class='test_$$']*5>{item $}
    `
})
class Test03 {
    constructor() { }
}