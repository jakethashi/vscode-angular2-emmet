declare var Component: any;

@Component({
    selector: 'test',
    template: `
        (div>dl>(dt+dd)*3)+footer>p
    `
})
class GroupingTest2 {
    constructor() {         
    }
}