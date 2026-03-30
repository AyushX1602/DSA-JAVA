
import java.util.Scanner;

public class powerLinear {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter the base: ");
        int a = sc.nextInt();
        System.out.print("Enter the power: ");
        int b = sc.nextInt();
        System.out.println(power(a, b));
    }
    // public static int power (int a, int b){
    //     if(b==0) return 1;
    //     return a*power(a, b-1);
    // }


    public static int power (int a, int b){
        if(b==0) return 1;
        int ans  = power (a, b/2);
        if(b%2==0) return ans*ans;
        else return a*ans*ans;
    }
}
