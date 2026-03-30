import java.util.*;


public class Methods{
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // System.out.println("Enter the value of x:");
        // int x = sc.nextInt();
        // System.out.println("Enter the value of y:");
        // int y = sc.nextInt();
        // System.out.println("Enter the value of z:");
        // int z = sc.nextInt();
        // int c = Math.max(z, Math.max(x, y));
        // System.out.println("The greatest value is "+c);



        //P and C

        // int n = sc.nextInt();
        // int r = sc.nextInt();

        // int fact_n = 1;
        // for(int i = 1; i<=n ; i++){
        //     fact_n = fact_n * i;
        // }
        // int fact_r = 1;
        //         for(int i = 1; i<=r ; i++){
        //     fact_r = fact_r * i;
        // }

        // int fact_n_r = 1;
        //         for(int i = 1; i<=(n-r) ; i++){
        //     fact_n_r = fact_n_r * i;
        // }
   
        // int ncr= fact_n/(fact_r * fact_n_r);
        // System.out.println((ncr));
        // int npr = fact_n/fact_n_r;
        // System.out.println(npr);

           
    int n = sc.nextInt();
    int r = sc.nextInt();
    int ncr = fact(n)/(fact(r) * fact(n-r));
    System.out.println((ncr));
    int npr = fact(n)/fact(n-r);
    System.out.println(npr);

}

public static int fact(int x){
    int fact = 1;
    for(int i = 1; i<=x ; i++){
        fact = fact * i;
    }
    return fact;
}
}