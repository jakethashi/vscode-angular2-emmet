export interface ComponentMetadataFactory {
    (obj: {
        selector?: string;
        template?: string;
    });
}
declare var Component: ComponentMetadataFactory;

@Component({
    selector: 'test',
    template: `
        ul>li*3
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

