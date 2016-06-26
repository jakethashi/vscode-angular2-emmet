export interface ComponentMetadataFactory {
    (obj: {
        selector?: string;
        template?: string;
    });
}
declare var Component: ComponentMetadataFactory;

@Component({
    selector: 'test',
    template : `div>ul>li*3` 
})
class AppComponent {
    constructor() { }

    ngOnInit() { }

}