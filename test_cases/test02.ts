declare var Component: any;

@Component({
    selector: 'test',
    template: `
        (.one>h1)+(.two>h1)
    `
})
class Test02 {
    constructor() { }
}