declare var Component: any;

@Component({
    selector: 'test',
    template: `
        <div id="header"></div>
        <div class="page"></div>
        <div id="footer" class="class1 class2 class3"></div>
    `
})
class IdAndClassTestResult {
    constructor() {         
    }
}