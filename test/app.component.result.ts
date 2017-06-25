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
         <ul class="list">
             <li class="test_01">item_01</li>
             <li class="test_02">item_02</li>
             <li class="test_03">item_03</li>
             <li class="test_04">item_04</li>
             <li class="test_05">item_05</li>
         </ul>
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
