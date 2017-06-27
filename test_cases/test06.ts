declare var Component: any;

@Component({
    selector: 'test',
    template: `
        div+div>p>span+em
    `
})
class ClimbUpTest {
    constructor() {         
    }
}