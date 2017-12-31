import {Injectable} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/take';
import { SharedService } from './shared.service';
@Injectable()
export class CartService {

  cartItems : FirebaseListObservable<any>;
  orderItems: FirebaseListObservable<any>;

  cartAmount : number  = 0;
  constructor(public db: AngularFireDatabase,
              private sharedService: SharedService
  ) {}
  
  loadCartList(userid : string)  {
     this.cartItems = this.db.list('cart/'+userid);

     this.cartItems.subscribe(
        (rows) => {
          this.cartAmount  = 0;
          rows.forEach(row => { 
            this.cartAmount = this.cartAmount + (row.quantity*row.price);
          });
        },
        (err) => {
          console.log('Echoué');
        },
        () => { 
          this.sharedService.showToast('Réussi !');
        }
	  );

  };

  addCartItem(userid : string, product: any){
   

    this.loadCartList(userid);
    
    this.db.object(`cart/${userid}/${product.$key}`, {preserveSnapshot:true} ).first().subscribe(data => {
      if(data.val() !== null) {
        this.incrementCartItem(userid,product);
      } else {
        
        this.db.object('products/'+product.$key, { preserveSnapshot: true }).first().subscribe(productData =>{

          if( productData.val().stock!=0 && productData.val().available == true){ 
       
            var cartItem : any =  {   
                image: product.image,
                name:  product.name,
                price: product.price,
                quantity:1
            }
            this.cartItems.update(product.$key , cartItem);
            this.sharedService.showToast("Ajouté !");
          }else{
            this.sharedService.showToast("Plus en stock :( ");
          }
        });

      }
    });


  };

  removeCartItem(userid : string, productId : string){
    this.loadCartList(userid);
    this.cartItems.remove(productId).then(_ => this.sharedService.showToast("Supprimé !") );
  };

  decrementCartItem(userid : string, product : any){
    this.loadCartList(userid);
    
    this.db.object(`cart/${userid}/${product.$key}`, {preserveSnapshot:true} ).first().subscribe(data => {
      if(data.val() !== null) {

        if(data.val().quantity-1 > 0){
            this.cartItems.update(product.$key , {quantity: data.val().quantity - 1 });
        }else{
            this.removeCartItem(userid,product.$key);
        }

      }else{
          this.sharedService.showToast("Il n'y a rien.");
      } 
    });
  };

  incrementCartItem(userid : string, product : any){
    
   

    this.loadCartList(userid);
    
    this.db.object(`cart/${userid}/${product.$key}`, {preserveSnapshot:true} ).first().subscribe(cartItem => {
      if(cartItem.val() !== null) {

        this.db.object('products/'+product.$key, { preserveSnapshot: true }).first().subscribe(productData =>{

          if(cartItem.val().quantity+1 <= productData.val().stock && productData.val().available == true){ // checking cart stock
            this.sharedService.showToast('+1 ajouté !');
              this.cartItems.update(product.$key , {quantity: cartItem.val().quantity + 1 });
          }else{
              this.sharedService.showToast('Quota stock max atteint !');
          }
          
        });

      }else{
        this.sharedService.showToast('Plus rien à ajouter!');
      } 
    });

  };
  
  checkout(userid: string, deliveryDetails : string ){

    this.loadCartList(userid);

    var cartItemUnsubscribed = this.db.list('cart/'+userid).take(1);

    var orderItem : FirebaseListObservable<any> = this.db.list('orders/'+userid);
    
    cartItemUnsubscribed.forEach(rows => {
      rows.forEach(cartItem => { 
        
        cartItem.status = 1;
        cartItem.delivery = deliveryDetails;

        this.db.object('products/'+cartItem.$key, { preserveSnapshot: true }).first().subscribe(productData =>{
          if(cartItem.quantity <= productData.val().stock && productData.val().available== true){
            
            orderItem.push(cartItem);

            this.cartItems.remove(cartItem.$key); 

            this.db.object('products/'+cartItem.$key+'/stock').set(productData.val().stock - cartItem.quantity);
       
          }
        
        });
        
      });
    });


  }

  loadOrders(userid: string){
    this.orderItems = this.db.list('orders/'+userid);
  }
}
