import java.util.Scanner;

public class oneTnNtTone {
    static int n;
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        n = sc.nextInt();
        print (n);
    }
    public static void print (int n){
        if(n==0) return ;
        System.out.println(n);
        print(n-1);
        if(n!=1) System.out.println(n);
    }
}
