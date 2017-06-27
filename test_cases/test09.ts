declare var Component: any;

@Component({
    selector: 'test',
    template: `
        ul>li*5
    `
})
class MultiplicationTest {
    constructor() {         
    }
}