export interface ComponentMetadataFactory {
    (obj: {
        selector?: string;
        template?: string;
    });
}
declare var Component: ComponentMetadataFactory;

// .wrap>p>a^p
// (.one>h1)+(.two>h1)
// ul.list>li[class='test_$$']*5>lorem4

@Component({
    selector: 'test',
    template: `
        ul.list>li[class='test_$$']*5>lorem4
    `
})
class AppComponent {
    constructor() { }

    ngOnInit() { }

}

let foo = {
    name: 'john',
    city: 'john',
    age: 123
};
