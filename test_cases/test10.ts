declare var Component: any;

@Component({
    selector: 'test',
    template: `
        div>(header>ul>li*2>a)+footer>p
    `
})
class GroupingTest {
    constructor() {         
    }
}