import java.util.Scanner;

public class patterns2 {
   public static void main(String[] args) {
    
    // Scanner sc =new Scanner(System.in);
    //     int row = sc.nextInt();
    //     int col = sc.nextInt();

    //     for( int i=0; i<row;i++){
    //         for(int j=0; j<col; j++){
    //             System.out.print('*');
    //         }
    //         System.out.println();
    //     }

        // Scanner sc =new Scanner(System.in);
        // int n = sc.nextInt();
        

        // for( int i=1; i<=n;i++){
        //     for(int j=1; j<=n; j++){
        //         System.out.print(j+" ");
        //     }
        //     System.out.println();
        // }

    // Scanner sc =new Scanner(System.in);
    //     int n = sc.nextInt();
        
    //     for( int i=1; i<=n;i++){
    //         for(int j=1; j<=n; j++){
    //             System.out.print((char)(j+64)+" ");
    //         }
    //         System.out.println();
    //     }

      
    //  Scanner sc =new Scanner(System.in);
        // int n = sc.nextInt();
        
        // for( int i=1; i<=n;i++){
        //     for(int j=1; j<=n; j++){
        //         System.out.print(i+" ");
        //     }
        //     System.out.println();
        // }


        //     Scanner sc =new Scanner(System.in);
        // int n = sc.nextInt();
        
        // for( int i=1; i<=n;i++){
        //     for(int j=1; j<=n; j++){
        //         System.out.print((char)(i+64)+" ");
        //     }
        //     System.out.println();
        // }


        // Scanner sc =new Scanner(System.in);
        // int n = sc.nextInt();
        
        // for( int i=1; i<=n;i++){
        //     for(int j=1; j<=n; j++){
        //         if(i%2==0){
        //         System.out.print((char)(i+96)+" ");
        //         }
        //         else {
        //             System.out.print((char)(i+64)+" ");
        //         }
        //     }
        //     System.out.println();
        // }

                // OR

//     Scanner sc = new Scanner(System.in);
// int n = sc.nextInt();

// for(int i = 1; i <= n; i++){
//     for(int j = 1; j <= n; j++){
//         int offset = (i % 2 == 1) ? 96 : 64;
//         System.out.print((char)(j + offset) + " ");
//     }
//     System.out.println();
// }

    // Scanner sc = new Scanner(System.in);
    // int n = sc.nextInt();   

    // for(int i=1;i<=n;i++){
    //     for(int j=1; j<=i ;j++){
    //         System.out.print("*"+"");
    //     }
    //     System.out.println();
    // }


    //     Scanner sc = new Scanner(System.in);
    // int n = sc.nextInt();   

    // for(int i=1;i<=n;i++){
    //     for(int j=1; j<=i ;j++){
    //         System.out.print(j+" ");
    //     }
    //     System.out.println();
    // }

    
    // Scanner sc = new Scanner(System.in);
    // int n = sc.nextInt();   

    // for(int i=1;i<=n;i++){
    //     for(int j=1; j<=i ;j++){
    //         if(i%2==0){
    //             System.out.print((char)((j)+64)+" ");
    //             }
    //             else {
    //                 System.out.print(j+" ");
    //             }
    //     }
    //     System.out.println();
    // }


// Flipped triangle

    // Scanner sc = new Scanner(System.in);
    // int n = sc.nextInt(); 

    // for(int i=1; i<=n;i++){
    //     for(int j=1; j<=n-i+1; j++){
    //         System.out.print((char)(j+64)+" ");
    //     }
    //     System.out.println();
    // }

    // Scanner sc = new Scanner(System.in);
    // int n = sc.nextInt();   

    // for(int i=1;i<=n;i++){
    //     for(int j=1; j<=n+1-i ; j++){
    //         System.out.print((char)(i+64)+" ");
    //     }
    //     System.out.println();
    // }



    // Hollow Reactangle
    Scanner sc = new Scanner(System.in);

    int row = sc.nextInt();

    int col = sc.nextInt();

    for(int i = 1; i <= row; i++){
        for(int j = 1; j <= col; j++){
            // Print * only for borders (first/last row OR first/last column)
            if(i == 1 || i == row || j == 1 || j == col){
                System.out.print("* ");
            } else {
                System.out.print("  "); // Two spaces for hollow inside
            }
        }
        System.out.println();
    }


        
    // Scanner sc = new Scanner(System.in);
    // int row = sc.nextInt();
    // int col = sc.nextInt();

    // for(int i = 1; i <= row; i++){
    //     for(int j = 1; j <= col; j++){
    //         // Print * only for borders (first/last row OR first/last column)
    //         if(row/2+1 == i || col/2+1 == j) {
    //             System.out.print("* ");
    //         } else {
    //             System.out.print("  "); // Two spaces for hollow inside
    //         }
    //     }
    //     System.out.println();
    // }

    
    
    //Better approach
    // Scanner sc = new Scanner(System.in);
    // int n = sc.nextInt();
    

    // for(int i = 1; i <= n; i++){
    //     for(int j = 1; j <= n; j++){
    //         if(n/2+1 == i || n/2+1 == j) {
    //             System.out.print("* ");
    //         } else {
    //             System.out.print("  "); // Two spaces for hollow inside
    //         }
    //     }
    //     System.out.println();
    // }



    //     Scanner sc = new Scanner(System.in);
    // int n = sc.nextInt();
    
    // for(int i = 1; i <= n; i++){
    //     for(int j = 1; j <= n; j++){
    //         if( i==j || i+j==n+1 ) {
    //             System.out.print("* ");
    //         } else {
    //             System.out.print("  "); // Two spaces for hollow inside
    //         }
    //     }
    //     System.out.println();
    // }


    // Scanner sc = new Scanner(System.in);
    // int n= sc.nextInt();
    // int a =1;
    // for(int i = 1; i <= n; i++){
    //     for(int j = 1; j <= i; j++){
    //      System.out.print(a++ +" ");
    //     }
    //     System.out.println();
    // }



    //     Scanner sc = new Scanner(System.in);
    // int n= sc.nextInt();
    // for(int i = 1; i <= n; i++){
    //     for(int j = 1; j <= i; j++){
    //         if((i+j)%2==0) System.out.print(1 +" ");
    //         else System.out.print(0+" ");
    //     }
    //     System.out.println();
    // }


    // Scanner sc = new Scanner(System.in);
    // int n= sc.nextInt();
    // for(int i = 1; i <= n; i++){
    //     int a = 3; // Reset for each row
    //     for(int j = 1; j <= i; j++){
    //         if(j == 1) {
    //             System.out.print(1 + " ");
    //         } else {
    //             System.out.print(a + " ");
    //             a += 2; // Increment to next odd number
    //         }
    //     }
    //     System.out.println();
    // }



    // Scanner sc = new Scanner(System.in);
    // int n= sc.nextInt();
    // for(int i = 1; i <= n; i++){
    //     for(int j = 1; j <= i; j++){
    //         if(i%2==0) {
    //             System.out.print((char)(j+64)+ " ");
    //         } else {
    //             System.out.print(j+ " ");
    //         }
    //     }
    //     System.out.println();
    // }



    //flipped triangle
    // Scanner sc = new Scanner(System.in);
    // int n= sc.nextInt();
    // for(int i = 1; i <= n; i++){
    //     for(int j = 1; j <= n; j++){
    //         if(i+j>n){
    //             System.out.print("* ");
    //         } else {
    //             System.out.print("  ");
    //         }
    //     }
    //     System.out.println();
    // }
                //OR
                //more optimized
    // Scanner sc = new Scanner(System.in);
    // int n= sc.nextInt();
    // for(int i = 1; i <= n; i++){
    //     for(int j = 1; j <= n-i; j++){
    //        System.out.print("  ");
    //     }
    //     for(int j=1; j<=i; j++){
    //         System.out.print("* ");
    //     }   
    //     System.out.println();
    // }



    //     Scanner sc = new Scanner(System.in);
    // int n= sc.nextInt();
    // for(int i = 1; i <= n; i++){
    //     for(int j = 1; j <= n-i; j++){
    //        System.out.print("  ");
    //     }
    //     for(int j=1; j<=i; j++){
    //         System.out.print(j+" ");
    //     }   
    //     System.out.println();
    // }



    //     Scanner sc = new Scanner(System.in);
    // int n= sc.nextInt();
    // for(int i = 1; i <= n; i++){
    //     for(int j = 1; j <= n-i; j++){
    //        System.out.print("  ");
    //     }
    //     for(int j=1; j<=i; j++){
    //         System.out.print((char)(i+64)+" ");
    //     }   
    //     System.out.println();
    // }





//    Scanner sc = new Scanner(System.in);
//     int n= sc.nextInt();
//     for(int i = 1; i <= n; i++){
//         for(int j = 1; j <= i; j++){
//            System.out.print("  ");
//         }
//         for(int j=1; j<=n-i; j++){
//             System.out.print("* ");
//         }   
//         System.out.println();
//     }




    //Rohmbus 
    //    Scanner sc = new Scanner(System.in);
    // int n= sc.nextInt();
    // for(int i = 1; i <= n; i++){
    //     for(int j = 1; j <= n-i; j++){
    //        System.out.print("  ");
    //     }
    //     for(int j=1; j<=n; j++){
    //         System.out.print("* ");
    //     }   
    //     System.out.println();
    // }



    //Pyramid 
    //    Scanner sc = new Scanner(System.in);
    // int n= sc.nextInt();
    // for(int i = 1; i <= n; i++){
    //     for(int j = 1; j <= n-i; j++){
    //        System.out.print("   " );
    //     }
    //     for(int j=1; j<=2*i-1; j++){
    //         System.out.print("* "+" ");
    //     }   
    //     System.out.println();
    // }


    //        Scanner sc = new Scanner(System.in);
    // int n= sc.nextInt();
    // int nsp =n-1; int nst = 1;
    // for(int i = 1; i <= n; i++){
    //     for(int j = 1; j <= nsp; j++){
    //        System.out.print("   " );
    //     }
    //     for(int j=1; j<=nst; j++){
    //         System.out.print("* "+" ");
    //     }   
    //     System.out.println();
    //     nsp--;
    //     nst+=2;
    // }


        //diamond 

    // Scanner sc = new Scanner(System.in);
    // int n= sc.nextInt();
    // int nsp =n-1; int nst = 1;
    // for(int i = 1; i <= n; i++){
    //     for(int j = 1; j <= nsp; j++){
    //        System.out.print("   " );
    //     }
    //     for(int j=1; j<=nst; j++){
    //         System.out.print("* "+" ");
    //     }  
    //     nsp--;
    //     nst+=2; 
    //     System.out.println();

    // }
    // nsp =1; nst = 2*n-3;
    // for(int i = 1; i<=n-1; i++){
    //     for(int j = 1; j <= nsp; j++){
    //         System.out.print("   ");
    //     }
    //     for(int j=1;j<=nst;j++){
    //         System.out.print( "* "+" ");
    //     }
    //     nsp ++;
    //     nst -=2;
    //     System.out.println();
    // }


//     Bridge pattern

//     Scanner sc = new Scanner(System.in);
//     int n = sc.nextInt();
//     for(int i=1; i<=2*n-1 ; i++){
//         System.out.print("* ");
//     }
//     System.out.println();
//     int nsp = 1;
//     for(int i=1;i<=n-1 ; i++){
//         for(int j=1 ; j<=n-i ; j++){
//             System.out.print("* ");
//         }
//        for(int j =1; j<=nsp ; j++){
//         System.out.print("  ");
//        }
//        for(int j=1 ; j<=n-i ; j++){
//         System.out.print("* ");
//     }
//     nsp+=2;
//     System.out.println();
//    }


// // Number spiral 

// Scanner sc = new Scanner(System.in);
// int n = sc.nextInt();

// for(int i =1; i<=n; i++){
//     for(int j=1;j<=n;j++){
//         System.out.print(Math.min(i, j)+" ");
//     }
//     System.out.println();
// }


   }
}

