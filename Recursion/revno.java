
public class revno {
    public static void main(String[] args){
        print(800);
    }

    public static void print(int n){
        if(n==0) return;

        System.out.print(n%10);
        print(n/10);
    }
}

