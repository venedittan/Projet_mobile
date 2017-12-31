import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController  } from 'ionic-angular';


import {CartService} from '../../providers/cart.service';
import {AuthService} from '../../providers/auth.service';
import {CustomerService} from '../../providers/customer.service';
import {SharedService} from '../../providers/shared.service';


import {OrdersPage} from '../orders/orders'

@IonicPage()
@Component({
  selector: 'page-billing',
  templateUrl: 'billing.html',
  providers: [CartService,AuthService,CustomerService,SharedService]
})
export class BillingPage {
  addresses :  any;
  delivery_details: string;
  payment_mode : string;
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,

              public alertCtrl: AlertController,

              public cartService: CartService,
              public authService: AuthService,
              public custService: CustomerService,
              public sharedService: SharedService
             ) {
        this.payment_mode="cod";
        this.delivery_details="";
        this.custService.loadDeliveyAddress(this.authService.getLoggedUID());
        this.addresses = this.custService.deliveryAddresses;
        
  }

  pay() : void{
    if(this.payment_mode == "cod"){
      
      if(this.delivery_details == "" || this.delivery_details==undefined || this.delivery_details==null){
        this.sharedService.showToast("Select/Add Adress!");
      }else{
        this.cartService.checkout(this.authService.getLoggedUID() ,this.delivery_details);
        this.navCtrl.setRoot(OrdersPage);
      }
    
    }else if(this.payment_mode=="paypal"){

    }
    
  }

  addAddress() : void{
    this.addressManipulation(false,null);
  }


  addressManipulation(edit:boolean, address :any) : any {
    var popup_title = "Modifier l'adresse"
    if(edit == false){
      popup_title = "Ajouter l'adresse";
      address = { 
        nickname:'',
        address:'',
        pincode:'',
        phone:''
      }
    }

    let prompt = this.alertCtrl.create({
      title: popup_title,
      inputs: [
        {
          name: 'nickname',
          placeholder: 'Nom',
          value :address.nickname
        },
        {
          name: 'address',
          placeholder: 'Adresse ',
          value :address.address
        },
        {
          name: 'pincode',
          placeholder: 'Code Postal',
          type: 'number',
          value :address.pincode
        },
        {
          name: 'phone',
          placeholder: 'Téléphone',
          type: 'number',
          value :address.phone
        }
      ],
      buttons: [
        {
          text: 'Annuler',
        },
        {
          text: 'Enregistrer',
          handler: data => {
            if (!data.nickname || !data.address || !data.pincode || !data.phone ) {
              this.sharedService.showToast("Données incorrectes !");
              event.stopPropagation(); 
            }
          }
        }
      ]
    });
    prompt.present();
    

  }

}
