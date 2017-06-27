declare var Component: any;

@Component({
    selector: 'test',
    template: `
        div+div>p>span+em^^^bq
    `
})
class ClimbUpTest3 {
    constructor() {         
    }
}