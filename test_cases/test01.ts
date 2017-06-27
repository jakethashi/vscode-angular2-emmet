declare var Component: any;

@Component({
    selector: 'test',
    template: `
        .wrap>p>a^p
    `
})
class Test01 {
    constructor() { }
}