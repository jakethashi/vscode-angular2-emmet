export interface ComponentMetadataFactory {
    (obj: {
        selector?: string;
        template?: string;
    });
}
declare var Component: ComponentMetadataFactory;

// .wrap>p>a^p
// (.one>h1)+(.two>h1)

@Component({
    selector: 'test',
    template: `
        (.one>h1)+(.two>h1)
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
