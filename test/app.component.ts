export interface ComponentMetadataFactory {
    (obj: {
        selector?: string;
        template?: string;
    });
}
declare var Component: ComponentMetadataFactory;

@Component({
    selector: 'test',
    template : `div` 
})
class AppComponent {
    constructor() { }

    ngOnInit() { }

}