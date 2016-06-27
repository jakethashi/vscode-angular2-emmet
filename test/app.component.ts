export interface ComponentMetadataFactory {
    (obj: {
        selector?: string;
        template?: string;
    });
}
declare var Component: ComponentMetadataFactory;

@Component({
    selector: 'test',
    template : `` 
})
class AppComponent {
    constructor() { }

    ngOnInit() { }

}